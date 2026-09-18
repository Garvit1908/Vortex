import React from 'react';
import { CheckCircle, ShieldCheck, Clock, Check, AlertTriangle, XCircle } from 'lucide-react';

export const VerifiedBadge = ({ size = 'sm' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full bg-[#F2F6B1] text-[#1C220E] border border-[#CDDE42] ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      title="Vortex Verified Provider"
    >
      <ShieldCheck className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#758045]`} />
      <span>Verified</span>
    </span>
  );
};

export const OrderStatusBadge = ({ status }) => {
  const configs = {
    pending: {
      bg: 'bg-[#FAF9EE] text-[#1C220E] border-[#9EA96F]/30',
      icon: Clock,
      label: 'Pending Acceptance',
    },
    accepted: {
      bg: 'bg-[#F2F6B1] text-[#1C220E] border-[#CDDE42]',
      icon: Check,
      label: 'Accepted (Awaiting Escrow)',
    },
    'in-progress': {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Clock,
      label: 'In Progress (Escrow Funded)',
    },
    delivered: {
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: CheckCircle,
      label: 'Delivered (Awaiting Approval)',
    },
    completed: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle,
      label: 'Completed & Released',
    },
    disputed: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertTriangle,
      label: 'In Dispute',
    },
    cancelled: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: XCircle,
      label: 'Cancelled',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
