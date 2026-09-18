import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ShieldCheck, Star, ExternalLink, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { VerifiedBadge } from '../components/Badge';
import { RatingStars } from '../components/RatingStars';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const FreelancersPage = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(search && { search }),
        ...(verifiedOnly && { verified: 'true' }),
      }).toString();

      const res = await api.get(`/users/providers?${query}`);
      if (res.data.success) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [search, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C220E] uppercase font-display tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-[#758045]" />
            <span>Verified Talent Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1C220E]/60 mt-1">
            Browse engineers, architects, designers, and specialists available for direct contract booking
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1C220E] select-none bg-white/90 px-3.5 py-2.5 rounded-xl border border-[#9EA96F]/25 hover:border-[#9EA96F]/40 shadow-xs transition">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-[#9EA96F]/30 text-[#1C220E] focus:ring-0"
            />
            <ShieldCheck className="w-4 h-4 text-[#758045]" />
            <span>Verified Providers Only</span>
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="w-5 h-5 text-[#9EA96F] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search specialists by skill, name, or role (e.g., Python, React, Cloud Architect, UI/UX)..."
          className="w-full pl-12 pr-4 py-3 bg-white/90 border border-[#9EA96F]/25 focus:border-[#CDDE42] focus:ring-2 focus:ring-[#CDDE42]/20 rounded-2xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition shadow-xs"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#1C220E]/60">
          <div className="w-10 h-10 border-2 border-[#CDDE42] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Searching verified specialists...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white/80 p-12 text-center rounded-3xl border border-[#9EA96F]/20 shadow-xs space-y-2">
          <p className="text-sm font-bold text-[#1C220E]">No freelancers found</p>
          <p className="text-xs text-[#1C220E]/60">Try modifying your search criteria or clearing verified filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p._id}
              className="bg-white/90 rounded-3xl border border-[#9EA96F]/20 p-6 flex flex-col justify-between space-y-5 group hover:border-[#CDDE42] hover:shadow-luxury transition duration-300 shadow-xs"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start gap-4">
                  {p.profilePhoto ? (
                    <img
                      src={p.profilePhoto}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#CDDE42]/30 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-xl font-bold shrink-0 shadow-xs">
                      {p.name[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-[#1C220E] truncate">{p.name}</h3>
                      {p.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-xs text-[#758045] font-semibold truncate mt-0.5">
                      {p.title || 'Freelance Specialist'}
                    </p>
                    <div className="mt-1.5">
                      <RatingStars rating={p.ratingAverage} count={p.ratingCount} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-[#1C220E]/70 line-clamp-3 leading-relaxed">
                  {p.bio || 'Experienced verified service provider on the Vortex freelance platform.'}
                </p>

                {/* Skills badges */}
                {p.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#F2F6B1]/40 border border-[#9EA96F]/20 text-[10px] font-semibold text-[#1C220E]"
                      >
                        {s}
                      </span>
                    ))}
                    {p.skills.length > 4 && (
                      <span className="text-[10px] text-[#1C220E]/50 self-center">
                        +{p.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom: Rate & Link */}
              <div className="pt-4 border-t border-[#9EA96F]/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1C220E]/40 block">Rate</span>
                  <span className="text-xs font-bold text-[#1C220E]">
                    ₹{p.pricing?.hourlyRate > 0 ? `${p.pricing.hourlyRate}/hr` : 'From ₹' + (p.pricing?.startingAt || 5000)}
                  </span>
                </div>

                <Link
                  to={`/profile/${p._id}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#FAF9EE] hover:bg-[#1C220E] text-[#1C220E] hover:text-[#CDDE42] text-xs font-bold uppercase tracking-wider border border-[#9EA96F]/25 transition group-hover:border-[#1C220E]"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
