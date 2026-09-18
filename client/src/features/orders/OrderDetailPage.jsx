import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  CreditCard,
  Upload,
  FileText,
  MessageSquare,
  Star,
  Check,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { OrderStatusBadge } from '../../components/Badge';
import { OrderChat } from '../chat/OrderChat';
import { ReviewModal } from '../reviews/ReviewModal';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Delivery submission modal
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryFile, setDeliveryFile] = useState(null);

  // Dispute modal
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Listen for real-time status updates via Socket.IO
  useEffect(() => {
    if (!socket || !id) return;

    const handleStatusUpdate = (data) => {
      if (data.orderId === id) {
        setOrder((prev) => (prev ? { ...prev, ...data } : prev));
        // Refresh full order to stay in sync
        fetchOrder();
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket, id]);

  const isClient = user && (user.id === order?.client?._id || user._id === order?.client?._id);
  const isProvider = user && (user.id === order?.provider?._id || user._id === order?.provider?._id);
  const isAdmin = user?.role === 'admin';

  // 1. Provider Accepts Order
  const handleAcceptOrder = async () => {
    setActionLoading(true);
    try {
      const res = await api.put(`/orders/${order._id}/accept`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Client Pays into Escrow (Razorpay Test Mode)
  const handlePayEscrow = async () => {
    setActionLoading(true);
    try {
      // Step A: Create order on backend
      const createRes = await api.post('/payments/create-order', { orderId: order._id });
      if (!createRes.data.success) throw new Error('Order creation failed');

      const { razorpayOrder, keyId } = createRes.data;

      // Check if Razorpay script is loaded on window
      if (window.Razorpay && !razorpayOrder.isSimulation) {
        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Vortex Marketplace Escrow',
          description: `Escrow funding for order: ${order.title}`,
          order_id: razorpayOrder.id,
          handler: async (response) => {
            // Step B: Verify signature on backend
            const verifyRes = await api.post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              setOrder(verifyRes.data.order);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: { color: '#0e8ce8' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback / Simulated Test Mode (when placeholder key is used or script unavailable)
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSig = `mock_sig_${Date.now()}`;

        const verifyRes = await api.post('/payments/verify', {
          orderId: order._id,
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSig,
        });

        if (verifyRes.data.success) {
          setOrder(verifyRes.data.order);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Provider Submits Delivery
  const handleDeliverSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('message', deliveryMessage);
      if (deliveryFile) formData.append('deliveryFile', deliveryFile);

      const res = await api.put(`/orders/${order._id}/deliver`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setOrder(res.data.order);
        setIsDeliverModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit delivery');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Client Completes Order & Releases Escrow
  const handleCompleteOrder = async () => {
    if (!window.confirm('Approve deliverables and release ₹' + order.price.toLocaleString() + ' from escrow to the provider?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/orders/${order._id}/complete`);
      if (res.data.success) {
        setOrder(res.data.order);
        // Prompt for review
        setIsReviewModalOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Raise Dispute
  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/orders/${order._id}/dispute`, {
        reason: disputeReason.trim(),
      });
      if (res.data.success) {
        setOrder(res.data.order);
        setIsDisputeModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Order Unavailable</h2>
        <p className="text-slate-500 mt-2">{error || 'You do not have permission to view this order.'}</p>
        <Link to="/orders" className="inline-block mt-4 text-[#758045] hover:text-[#1C220E] font-semibold hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  // Steps for visual status progress bar
  const STATUS_STEPS = [
    { key: 'pending', label: 'Booking Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'in-progress', label: 'Escrow Funded' },
    { key: 'delivered', label: 'Work Delivered' },
    { key: 'completed', label: 'Completed & Released' },
  ];

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <OrderStatusBadge status={order.status} />
              <span className="text-xs text-slate-500">
                Order ID: <span className="font-mono text-slate-800 font-bold">#{order._id}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{order.title}</h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Escrow Amount</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">₹{order.price?.toLocaleString()}</span>
            <span className="text-[11px] text-[#758045] font-bold block uppercase mt-0.5">
              Escrow: {order.escrowStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Visual Progress Stepper (if not disputed or cancelled) */}
        {order.status !== 'disputed' && order.status !== 'cancelled' && (
          <div className="pt-4 border-t border-[#9EA96F]/15">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isPassed
                          ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        isCurrent ? 'text-[#758045] font-bold' : isPassed ? 'text-[#1C220E]' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dispute Alert Banner if Disputed */}
        {order.status === 'disputed' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-600 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Order Currently In Dispute</span>
            </div>
            <p className="leading-relaxed">
              Reason: "{order.disputeDetails?.reason || 'Mediation requested'}"
            </p>
            <p className="text-slate-500 pt-1">
              A platform administrator is reviewing the project timeline and messages to reach a fair resolution.
            </p>
          </div>
        )}
      </div>

      {/* Main Grid: Left Details & Action Cards, Right Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Action Panels & Deliverables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action Card: State Transitions */}
          <div className="bg-white p-6 rounded-3xl border border-[#9EA96F]/20 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Project Actions & Milestones
            </h3>

            {/* 1. Pending: Provider needs to accept */}
            {order.status === 'pending' && (
              <div className="p-4 rounded-2xl bg-[#FAF9EE]/50 border border-[#9EA96F]/20 space-y-3">
                <p className="text-xs text-[#1C220E]/70">
                  {isProvider
                    ? 'A client requested this service. Review project requirements below and accept to proceed.'
                    : 'Your booking has been sent. Waiting for the provider to accept.'}
                </p>
                {isProvider && (
                  <button
                    onClick={handleAcceptOrder}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 text-[#CDDE42]" />
                    <span>Accept Booking & Request Escrow Funding</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. Accepted: Client needs to fund Escrow */}
            {order.status === 'accepted' && (
              <div className="p-5 rounded-2xl bg-[#FAF9EE] border border-[#9EA96F]/30 space-y-3">
                <div className="flex items-center gap-2 font-bold text-[#1C220E] text-sm">
                  <Lock className="w-4 h-4 text-[#758045]" />
                  <span>Funding Escrow Required</span>
                </div>
                <p className="text-xs text-[#1C220E]/80 leading-relaxed">
                  {isClient
                    ? 'The provider has accepted your project. Deposit funds into Escrow using Razorpay test mode to trigger the provider to begin work.'
                    : 'Booking accepted! Waiting for client to deposit funds into Escrow before you begin work.'}
                </p>

                {isClient && (
                  <button
                    onClick={handlePayEscrow}
                    disabled={actionLoading}
                    className="w-full py-3 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-[#CDDE42]" />
                    <span>Pay ₹{order.price.toLocaleString()} into Escrow (Razorpay Test Mode)</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. In Progress: Provider working, can deliver */}
            {order.status === 'in-progress' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 text-sm font-bold">
                  <Clock className="w-4 h-4 text-[#758045]" />
                  <span>Work In Progress (Escrow Locked)</span>
                </div>
                <p className="text-xs text-slate-600">
                  {isProvider
                    ? 'Funds are locked in Escrow. Once your deliverables are ready, submit your work here.'
                    : 'The provider is actively building your project. You can communicate milestones via live chat.'}
                </p>

                {isProvider && (
                  <button
                    onClick={() => setIsDeliverModalOpen(true)}
                    className="w-full py-2.5 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#CDDE42]" />
                    <span>Submit Completed Work</span>
                  </button>
                )}
              </div>
            )}

            {/* 4. Delivered: Client needs to approve and complete */}
            {order.status === 'delivered' && (
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Work Delivered for Review</span>
                </div>
                <p className="text-xs text-purple-800">
                  {isClient
                    ? 'Please inspect the delivered files and notes below. When satisfied, click Complete & Release to disburse escrow funds.'
                    : 'Work has been submitted. Waiting for the client to review and release funds.'}
                </p>

                {isClient && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <button
                      onClick={handleCompleteOrder}
                      disabled={actionLoading}
                      className="flex-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glow transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Release Payment</span>
                    </button>

                    <button
                      onClick={() => setIsDisputeModalOpen(true)}
                      className="px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-300"
                    >
                      Raise Dispute
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. Completed: Review CTA */}
            {order.status === 'completed' && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Order Completed & Escrow Disbursed</span>
                </div>
                <p className="text-xs text-emerald-700">
                  ₹{order.price.toLocaleString()} was credited to {order.provider?.name}'s balance.
                </p>

                {isClient && !order.hasReview && (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full py-2.5 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4 text-[#CDDE42]" />
                    <span>Leave a Review</span>
                  </button>
                )}

                {order.hasReview && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Review submitted for this order. Thank you!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery Submission View (if delivered or completed) */}
          {order.deliverySubmission?.submittedAt && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#758045]" />
                <span>Delivered Work</span>
              </h3>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {order.deliverySubmission.message}
              </p>

              {order.deliverySubmission.fileUrl && (
                <div className="pt-2">
                  <a
                    href={order.deliverySubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-[#F2F6B1]/40 text-xs font-semibold text-[#1C220E] border border-slate-200 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Download Project Deliverables File</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Requirements Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Project Requirements Brief
            </h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {order.requirements || 'No specific requirements specified.'}
            </p>
          </div>

          {/* Counterparties Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Client</span>
              <p className="text-xs font-bold text-slate-900 truncate">{order.client?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{order.client?.email}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Provider</span>
              <p className="text-xs font-bold text-slate-900 truncate">{order.provider?.name}</p>
              <Link to={`/profile/${order.provider?._id}`} className="text-[11px] text-[#758045] hover:text-[#1C220E] hover:underline">
                View Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Embedded Real-time Chat */}
        <div className="lg:col-span-5">
          <OrderChat
            orderId={order._id}
            recipientName={isClient ? order.provider?.name : order.client?.name}
          />
        </div>
      </div>

      {/* Delivery Submission Modal */}
      <Modal
        isOpen={isDeliverModalOpen}
        onClose={() => setIsDeliverModalOpen(false)}
        title="Submit Project Deliverables"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleDeliverSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Delivery Notes / Readme
            </label>
            <textarea
              rows={4}
              required
              value={deliveryMessage}
              onChange={(e) => setDeliveryMessage(e.target.value)}
              placeholder="Explain what was accomplished, repository links, access instructions, or usage details..."
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#CDDE42] focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-xs text-slate-900 outline-none resize-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Deliverable File (ZIP, PDF, etc.)
            </label>
            <input
              type="file"
              onChange={(e) => setDeliveryFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeliverModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#CDDE42]" />
              <span>{actionLoading ? 'Submitting...' : 'Confirm Delivery'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Raise an Order Dispute"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRaiseDispute} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            Raising a dispute freezes escrow funds until an administrator arbitrates. Please explain clearly what issues occurred.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Dispute
            </label>
            <textarea
              rows={4}
              required
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Detail unmet criteria, delivery non-responsiveness, or missed project requirements..."
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-rose-500 rounded-xl text-xs text-slate-900 outline-none resize-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDisputeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Logging...' : 'Submit Dispute'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={order}
        onReviewSubmitted={() => {
          setOrder((prev) => ({ ...prev, hasReview: true }));
        }}
      />
    </div>
  );
};
