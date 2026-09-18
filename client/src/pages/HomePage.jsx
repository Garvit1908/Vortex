import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  Sparkles,
  Star,
  CheckCircle2,
  Users,
} from 'lucide-react';
import api from '../api/axios';
import { GigCard } from '../features/listings/GigCard';
import { VerifiedBadge } from '../components/Badge';
import { RatingStars } from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';

const POPULAR_SEARCHES = ['React', 'Figma', 'Node.js', 'Docker', 'UI/UX'];

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [gigsRes, providersRes] = await Promise.all([
          api.get('/gigs?limit=6&sort=rating'),
          api.get('/users/providers?limit=4&verified=true'),
        ]);

        if (gigsRes.data.success) setFeaturedGigs(gigsRes.data.gigs);
        if (providersRes.data.success) setTopProviders(providersRes.data.providers);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="pb-24 text-[#1C220E]">
      {/* 2-COLUMN EDITORIAL SPLIT HERO SECTION (Inspired by Reference Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline, Subtitle, CTAs, Search */}
          <div className="lg:col-span-7 space-y-7 text-left">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C220E] text-[#CDDE42] text-xs font-bold uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-[#CDDE42]" />
              <span>Guaranteed Escrow Protection</span>
            </div>

            {/* Giant Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#1C220E] tracking-tight uppercase font-display leading-[1.02]">
              Unleash Exceptional <br />
              <span className="text-[#758045]">Talent & Strategy</span>
            </h1>

            {/* Concise Subheadline */}
            <p className="text-base sm:text-lg text-[#1C220E]/70 max-w-xl font-normal leading-relaxed">
              We connect ambitious teams with verified digital specialists, engineers, and designers backed by complete escrow security.
            </p>

            {/* Action Row */}
            <div className="pt-1 flex flex-wrap items-center gap-3.5">
              <Link
                to="/explore"
                className="px-8 py-4 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] font-bold text-xs uppercase tracking-widest rounded-full shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4 text-[#CDDE42]" />
              </Link>

              <Link
                to="/ai-match"
                className="px-7 py-4 bg-white/90 hover:bg-[#F2F6B1]/50 border border-[#9EA96F]/30 text-[#1C220E] font-bold text-xs uppercase tracking-widest rounded-full transition flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#758045]" />
                <span>AI Match Talent</span>
              </Link>
            </div>

            {/* Integrated Search Pill */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl pt-2">
              <div className="flex items-center bg-white/95 border border-[#9EA96F]/30 rounded-full p-1.5 transition focus-within:border-[#CDDE42] focus-within:ring-2 focus-within:ring-[#CDDE42]/20 shadow-xs">
                <Search className="w-4 h-4 text-[#9EA96F] ml-3.5 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search services (e.g. React, UI/UX, Cloud, AI)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none pr-3"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#CDDE42] hover:bg-[#BDCE33] text-[#1C220E] font-bold text-xs uppercase tracking-wider transition shrink-0 shadow-xs"
                >
                  Search
                </button>
              </div>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#1C220E]/60">
                <span className="font-semibold text-[#1C220E]/40 uppercase text-[10px] tracking-wider">Popular:</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    type="button"
                    key={term}
                    onClick={() => navigate(`/explore?search=${encodeURIComponent(term)}`)}
                    className="hover:text-[#1C220E] transition hover:underline underline-offset-2 text-xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Right Column: Editorial Visual with Organic Silhouette Frame & Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4]">
              {/* Decorative pastel aura echoing reference layout */}
              <div className="absolute -inset-3 bg-gradient-to-tr from-[#EBE7FA] via-[#F2F6B1]/60 to-[#FAF9EE] rounded-[48px] rotate-1 blur-xs" />

              {/* Main Image Frame */}
              <div className="relative w-full h-full rounded-[44px] overflow-hidden border-2 border-[#9EA96F]/25 shadow-luxury bg-[#FAF9EE]">
                <img
                  src="/images/editorial-specialist.jpg"
                  alt="Elite Digital Specialist"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle bottom vignette inside image */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#14180A]/75 via-[#14180A]/30 to-transparent pointer-events-none" />

                {/* Micro-label on image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <div className="font-display font-bold uppercase tracking-wider text-[11px] drop-shadow-sm">
                    Verified Specialist
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/20">
                    <Star className="w-3 h-3 text-[#CDDE42] fill-[#CDDE42]" />
                    <span>5.0</span>
                  </div>
                </div>
              </div>

              {/* Floating Escrow Guarantee Badge */}
              <div className="absolute -top-3 -left-3 sm:-left-5 bg-white/95 backdrop-blur-md border border-[#9EA96F]/25 rounded-2xl p-3 shadow-luxury flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1C220E] text-[#CDDE42] flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#758045]">Escrow Protected</div>
                  <div className="text-xs font-black text-[#1C220E]">100% Funds Secured</div>
                </div>
              </div>

              {/* Floating Talent Badge */}
              <div className="absolute -bottom-4 -right-3 sm:-right-5 bg-white/95 backdrop-blur-md border border-[#9EA96F]/25 rounded-2xl p-3 shadow-luxury flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F2F6B1] text-[#1C220E] flex items-center justify-center shadow-xs shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#758045]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#758045]">Milestone Delivery</div>
                  <div className="text-xs font-black text-[#1C220E]">Verified Talent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MINIMALIST 3-PILLAR STRIP (Clean & Grounded) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#9EA96F]/20 border-y border-[#9EA96F]/20 py-8 text-center md:text-left">
          <div className="py-6 md:py-0 md:px-8 space-y-2">
            <div className="text-xs font-bold tracking-widest text-[#758045] uppercase font-mono">
              01 / Security
            </div>
            <h3 className="text-base font-bold text-[#1C220E]">Protected Escrow</h3>
            <p className="text-xs text-[#1C220E]/70 leading-relaxed">
              Funds are held safely in escrow and disbursed only after you inspect and approve deliverables.
            </p>
          </div>

          <div className="py-6 md:py-0 md:px-8 space-y-2">
            <div className="text-xs font-bold tracking-widest text-[#758045] uppercase font-mono">
              02 / Quality
            </div>
            <h3 className="text-base font-bold text-[#1C220E]">Verified Talent</h3>
            <p className="text-xs text-[#1C220E]/70 leading-relaxed">
              Curated specialists with verified profile badges, proven track records, and authentic client reviews.
            </p>
          </div>

          <div className="py-6 md:py-0 md:px-8 space-y-2">
            <div className="py-6 md:py-0 md:px-0 space-y-2">
              <div className="text-xs font-bold tracking-widest text-[#758045] uppercase font-mono">
                03 / Workflow
              </div>
              <h3 className="text-base font-bold text-[#1C220E]">Direct Collaboration</h3>
              <p className="text-xs text-[#1C220E]/70 leading-relaxed">
                Seamless order dashboard with real-time direct chat, file exchange, and milestone progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED SERVICES CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-20 sm:mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#9EA96F]/20 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#758045] block mb-1">
              Curated Marketplace
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C220E] uppercase font-display tracking-tight">
              Featured Services
            </h2>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold uppercase tracking-wider text-[#1C220E] hover:text-[#758045] flex items-center gap-1.5 transition"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#1C220E]/60">Loading curated services...</div>
        ) : featuredGigs.length === 0 ? (
          <div className="p-12 text-center bg-white/70 rounded-3xl border border-[#9EA96F]/20 text-xs text-[#1C220E]/60">
            No active services yet. Log in as a provider to publish a service.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>
        )}
      </section>

      {/* TOP TALENT DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-20 sm:mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#9EA96F]/20 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#758045] block mb-1">
              Independent Specialists
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C220E] uppercase font-display tracking-tight">
              Top Verified Freelancers
            </h2>
          </div>

          <Link
            to="/freelancers"
            className="text-xs font-bold uppercase tracking-wider text-[#1C220E] hover:text-[#758045] flex items-center gap-1.5 transition"
          >
            <span>Explore All Specialists</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProviders.map((p) => (
            <Link
              key={p._id}
              to={`/profile/${p._id}`}
              className="bg-white/85 rounded-3xl border border-[#9EA96F]/20 p-6 flex flex-col items-center text-center space-y-4 shadow-xs hover:border-[#CDDE42] hover:shadow-luxury transition duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#1C220E] text-[#CDDE42] font-bold text-lg flex items-center justify-center overflow-hidden shadow-xs ring-2 ring-[#CDDE42]/40 group-hover:scale-105 transition-transform">
                {p.profilePhoto ? (
                  <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{p.name?.[0]?.toUpperCase()}</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <h4 className="font-bold text-sm text-[#1C220E] group-hover:text-[#4D5627] transition">
                    {p.name}
                  </h4>
                  {p.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-xs text-[#1C220E]/60 line-clamp-1">{p.title || 'Independent Specialist'}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#1C220E]/80 pt-2 border-t border-[#9EA96F]/15 w-full justify-center">
                <Star className="w-3.5 h-3.5 text-[#CDDE42] fill-[#CDDE42]" />
                <span className="font-bold">{p.ratingAverage > 0 ? p.ratingAverage.toFixed(1) : '5.0'}</span>
                <span className="text-[#1C220E]/50">({p.ratingCount || 0})</span>
              </div>

              <div className="pt-2 text-xs font-semibold text-[#1C220E]/80">
                Rate: <span className="font-bold text-[#1C220E]">₹{p.pricing?.hourlyRate > 0 ? `${p.pricing.hourlyRate}/hr` : 'Negotiable'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EXECUTIVE STATEMENT / CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
        <div className="p-10 sm:p-16 rounded-3xl bg-[#14180A] text-[#FAF9EE] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-[#9EA96F]/30">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#CDDE42] block">
              High-Caliber Execution
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-display tracking-tight leading-tight">
              Ready to scale your vision?
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF9EE]/75 leading-relaxed">
              Commission elite engineers, designers, and consultants with zero friction and guaranteed escrow protection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            {isAuthenticated ? (
              user?.role === 'provider' ? (
                <Link
                  to="/create-gig"
                  className="px-8 py-3.5 bg-[#CDDE42] hover:bg-[#BDCE33] text-[#1C220E] font-black text-xs uppercase tracking-widest rounded-full shadow-md transition hover:scale-105"
                >
                  Post a Service
                </Link>
              ) : (
                <Link
                  to="/explore"
                  className="px-8 py-3.5 bg-[#CDDE42] hover:bg-[#BDCE33] text-[#1C220E] font-black text-xs uppercase tracking-widest rounded-full shadow-md transition hover:scale-105"
                >
                  Explore Services
                </Link>
              )
            ) : (
              <Link
                to="/register"
                className="px-8 py-3.5 bg-[#CDDE42] hover:bg-[#BDCE33] text-[#1C220E] font-black text-xs uppercase tracking-widest rounded-full shadow-md transition hover:scale-105"
              >
                Get Started
              </Link>
            )}

            <Link
              to={isAuthenticated ? '/orders' : '/explore'}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs uppercase tracking-widest rounded-full transition"
            >
              {isAuthenticated ? 'My Orders' : 'Browse Catalog'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
