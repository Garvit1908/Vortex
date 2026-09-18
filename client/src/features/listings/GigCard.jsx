import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Star, Layers } from 'lucide-react';
import { RatingStars } from '../../components/RatingStars';
import { VerifiedBadge } from '../../components/Badge';

export const GigCard = ({ gig }) => {
  return (
    <Link
      to={`/gigs/${gig._id}`}
      className="bg-white/85 rounded-3xl border border-[#9EA96F]/20 shadow-xs hover:border-[#CDDE42] hover:shadow-luxury flex flex-col overflow-hidden group h-full transition duration-300"
    >
      {/* Cover Media */}
      <div className="relative h-48 w-full bg-[#F2F6B1]/20 overflow-hidden">
        {gig.coverImage ? (
          <img
            src={gig.coverImage}
            alt={gig.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9EE] text-[#9EA96F]">
            <Layers className="w-10 h-10 stroke-1" />
            <span className="text-xs mt-1 font-medium text-[#758045]">Curated Service</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#1C220E]/90 text-[#FAF9EE] backdrop-blur-md shadow-xs">
            {gig.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Provider Header */}
          <div className="flex items-center gap-2.5 mb-2.5">
            {gig.provider?.profilePhoto ? (
              <img
                src={gig.provider.profilePhoto}
                alt={gig.provider.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#CDDE42]/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-[10px] font-bold shadow-xs">
                {gig.provider?.name?.[0]?.toUpperCase() || 'P'}
              </div>
            )}
            <span className="text-xs font-semibold text-[#1C220E]/80 truncate max-w-[120px]">
              {gig.provider?.name || 'Provider'}
            </span>
            {gig.provider?.isVerified && <VerifiedBadge size="sm" />}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-[#1C220E] group-hover:text-[#4D5627] transition leading-snug line-clamp-2">
            {gig.title}
          </h3>
        </div>

        {/* Card Footer: Rating, Delivery & Price */}
        <div className="pt-3 border-t border-[#9EA96F]/15 flex items-center justify-between">
          <div className="flex flex-col">
            <RatingStars rating={gig.ratingAverage} count={gig.ratingCount} size="sm" />
            <span className="text-[10px] text-[#1C220E]/60 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#758045]" />
              {gig.deliveryTime} {gig.deliveryTime === 1 ? 'day' : 'days'} delivery
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#1C220E]/50 block">Starting at</span>
            <span className="text-base font-black text-[#1C220E] group-hover:text-[#4D5627] transition">
              ₹{gig.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
