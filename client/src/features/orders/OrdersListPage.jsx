import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Clock, ShieldCheck, Filter } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { OrderStatusBadge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'completed', label: 'Completed' },
  { id: 'disputed', label: 'Disputed' },
];

export const OrdersListPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/my?status=${activeTab}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C220E] tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-8 h-8 text-[#758045]" />
            <span>Orders & Escrow Bookings</span>
          </h1>
          <p className="text-sm text-[#1C220E]/70 mt-1">
            {user?.role === 'provider'
              ? 'Manage projects commissioned by your clients with secured escrow milestones'
              : 'Track active deliverables, chat with providers, and approve payments'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#9EA96F]/20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm'
                : 'bg-white text-[#1C220E]/70 border border-[#9EA96F]/25 hover:text-[#1C220E] hover:bg-[#F2F6B1]/30 hover:border-[#CDDE42] shadow-xs'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingSpinner label="Retrieving bookings..." />
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#9EA96F]/20 shadow-sm space-y-3">
          <p className="text-sm font-bold text-[#1C220E]">No orders found</p>
          <p className="text-xs text-[#1C220E]/60">
            {activeTab === 'all'
              ? 'You have not initiated or received any bookings yet.'
              : `There are currently no orders in '${activeTab}' status.`}
          </p>
          <Link
            to="/explore"
            className="inline-block mt-3 px-6 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            Browse Marketplace Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isClient = user?.id === order.client?._id || user?._id === order.client?._id;
            const counterparty = isClient ? order.provider : order.client;

            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-[#9EA96F]/20 shadow-sm hover:shadow-md hover:border-[#CDDE42] block group transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Gig Info & Counterparty */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-[11px] text-[#1C220E]/50">
                        Order #{order._id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1C220E] group-hover:text-[#758045] transition truncate">
                      {order.title || order.gig?.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-[#1C220E]/70">
                      <span>{isClient ? 'Provider:' : 'Client:'}</span>
                      <span className="font-bold text-[#1C220E]">{counterparty?.name || 'User'}</span>
                    </div>
                  </div>

                  {/* Right: Price & Navigation */}
                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-[#1C220E]/50 block">Total Escrow</span>
                      <span className="text-lg font-black text-[#1C220E]">₹{order.price?.toLocaleString()}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9EE] border border-[#9EA96F]/25 text-[#9EA96F] group-hover:text-[#1C220E] group-hover:border-[#CDDE42] group-hover:bg-[#F2F6B1]/40 transition">
                      <ArrowRight className="w-4 h-4 text-[#758045]" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
