import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Briefcase,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import api from '../../api/axios';
import { VerifiedBadge, OrderStatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('metrics');
  const [loading, setLoading] = useState(true);

  // Dispute resolution state
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState(null);
  const [resolutionOutcome, setResolutionOutcome] = useState('released_to_provider');
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // User filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get(`/admin/users?role=${userRoleFilter}&search=${userSearch}`),
        api.get('/admin/orders'),
      ]);

      if (statsRes.data.success) setAnalytics(statsRes.data.analytics);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter, userSearch]);

  const handleToggleVerification = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/verify`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isVerified: res.data.isVerified } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle verification badge');
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDisputeOrder) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/orders/${selectedDisputeOrder._id}/resolve-dispute`, {
        resolutionOutcome,
        resolutionNote,
      });

      if (res.data.success) {
        setSelectedDisputeOrder(null);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading administrator portal..." />;
  }

  const disputedOrders = orders.filter((o) => o.status === 'disputed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-7 h-7 text-[#758045]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C220E] tracking-tight">
              Vortex Administrative Control
            </h1>
          </div>
          <p className="text-sm text-[#1C220E]/70">
            Platform governance, provider vetting badges, and dispute mediation center
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#FAF9EE] rounded-2xl border border-[#9EA96F]/20">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'metrics' ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm' : 'text-[#1C220E]/70 hover:text-[#1C220E]'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'users' ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm' : 'text-[#1C220E]/70 hover:text-[#1C220E]'
            }`}
          >
            Users & Verification ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'disputes' ? 'bg-rose-500 text-white shadow-sm' : 'text-[#1C220E]/70 hover:text-[#1C220E]'
            }`}
          >
            <span>Disputes</span>
            {disputedOrders.length > 0 && (
              <span className="w-4 h-4 bg-white text-rose-600 rounded-full text-[10px] flex items-center justify-center font-bold">
                {disputedOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm' : 'text-[#1C220E]/70 hover:text-[#1C220E]'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: METRICS & ANALYTICS */}
      {activeTab === 'metrics' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Platform Users
              </span>
              <p className="text-3xl font-black text-slate-900">{analytics.totalUsers}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span>Clients: {analytics.totalClients}</span>
                <span>•</span>
                <span>Providers: {analytics.totalProviders}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Verified Providers
              </span>
              <p className="text-3xl font-black text-[#1C220E]">{analytics.verifiedProviders}</p>
              <p className="text-[11px] text-slate-500 mt-2">
                {Math.round((analytics.verifiedProviders / (analytics.totalProviders || 1)) * 100)}% of providers verified
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Escrow Volume Handled
              </span>
              <p className="text-3xl font-black text-emerald-600">
                ₹{analytics.totalVolume?.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Platform Fees (10%): ₹{analytics.platformRevenue?.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active Disputes
              </span>
              <p className={`text-3xl font-black ${analytics.activeDisputes > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {analytics.activeDisputes}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Total Orders: {analytics.totalOrders}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Platform Health & Security
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span>Payment Gateway</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span>Live Messaging Service</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span>Escrow Protection Engine</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Recent Open Disputes
              </h3>
              {disputedOrders.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">
                  No active disputes. All orders are running smoothly!
                </p>
              ) : (
                <div className="space-y-2">
                  {disputedOrders.slice(0, 3).map((d) => (
                    <div
                      key={d._id}
                      onClick={() => {
                        setSelectedDisputeOrder(d);
                        setActiveTab('disputes');
                      }}
                      className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-100/70 transition"
                    >
                      <span className="text-xs font-bold text-slate-800 truncate max-w-xs">{d.title}</span>
                      <span className="text-xs text-rose-600 font-semibold">Review →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & PROVIDER VERIFICATION BADGE TOGGLE */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-[#CDDE42] shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none shadow-sm focus:border-[#CDDE42]"
              >
                <option value="all">All Roles</option>
                <option value="provider">Freelancers / Providers</option>
                <option value="client">Clients</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Verification Status</th>
                    <th className="px-6 py-4">Wallet Balance</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'provider' ? (
                          u.isVerified ? (
                            <VerifiedBadge size="sm" />
                          ) : (
                            <span className="text-slate-400 text-[11px]">Unverified</span>
                          )
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        ₹{(u.walletBalance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role === 'provider' ? (
                          <button
                            onClick={() => handleToggleVerification(u._id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              u.isVerified
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                : 'bg-[#F2F6B1] text-[#1C220E] hover:bg-[#E4EE7E] border border-[#CDDE42]'
                            }`}
                          >
                            {u.isVerified ? 'Revoke Badge' : 'Grant Badge'}
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTE MEDIATION */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          {disputedOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Zero Active Disputes</h3>
              <p className="text-xs text-slate-500">
                All client and provider contracts are either completed or operating harmoniously.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputedOrders.map((d) => (
                <div
                  key={d._id}
                  className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                          Disputed
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#{d._id}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{d.title}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Frozen Escrow</span>
                      <span className="text-xl font-black text-slate-900">₹{d.price?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-rose-700">Dispute Claim Reason:</p>
                    <p className="italic">"{d.disputeDetails?.reason || 'No statement submitted'}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-500 flex items-center gap-4">
                      <span>Client: <strong className="text-slate-800">{d.client?.name}</strong></span>
                      <span>•</span>
                      <span>Provider: <strong className="text-slate-800">{d.provider?.name}</strong></span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDisputeOrder(d);
                        setResolutionNote('');
                      }}
                      className="px-4 py-2 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      Arbitrate & Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ALL ORDERS LEDGER */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Order ID & Title</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Escrow Status</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <Link to={`/orders/${o._id}`} className="hover:text-[#758045] font-bold text-slate-900 block">
                        {o.title}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">#{o._id}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-800">{o.client?.name}</td>
                    <td className="px-6 py-4 text-slate-800">{o.provider?.name}</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 font-semibold uppercase text-[10px] text-[#758045]">
                      {o.escrowStatus?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      ₹{o.price?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Arbitrate Dispute Modal */}
      {selectedDisputeOrder && (
        <Modal
          isOpen={!!selectedDisputeOrder}
          onClose={() => setSelectedDisputeOrder(null)}
          title={`Arbitrate Dispute: ${selectedDisputeOrder.title}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleResolveDispute} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Value:</span>
                <span className="font-bold text-slate-900">₹{selectedDisputeOrder.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim:</span>
                <span className="text-rose-600 italic">"{selectedDisputeOrder.disputeDetails?.reason}"</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Arbitration Judgment Outcome
              </label>
              <select
                value={resolutionOutcome}
                onChange={(e) => setResolutionOutcome(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#CDDE42] focus:bg-white transition"
              >
                <option value="released_to_provider">
                  Release Escrow Funds to Provider (Mark Completed)
                </option>
                <option value="refunded_to_client">
                  Refund Escrow Funds to Client (Cancel Contract)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Arbitration Notes (Visible to Both Parties)
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Explain the mediation judgment..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#CDDE42] focus:bg-white resize-none transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDisputeOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] font-bold text-xs rounded-xl shadow-sm transition"
              >
                {actionLoading ? 'Executing resolution...' : 'Enforce Arbitration Verdict'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
