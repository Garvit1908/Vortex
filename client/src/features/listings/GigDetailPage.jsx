import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Star,
  Send,
  User,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { VerifiedBadge } from '../../components/Badge';
import { RatingStars } from '../../components/RatingStars';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const GigDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [gig, setGig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await api.get(`/gigs/${id}`);
        if (res.data.success) {
          setGig(res.data.gig);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load gig:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id]);

  const handleBookOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/gigs/${id}` } } });
      return;
    }

    if (gig.provider?._id === user?.id || gig.provider?._id === user?._id) {
      setOrderError('You cannot book your own service');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const res = await api.post('/orders', {
        gigId: gig._id,
        requirements,
      });

      if (res.data.success) {
        setIsBookModalOpen(false);
        navigate(`/orders/${res.data.order._id}`);
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place booking request');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading service details..." />;
  }

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Service Not Found</h2>
        <p className="text-slate-500 mt-2">The gig listing you requested is inactive or removed.</p>
        <Link to="/explore" className="inline-block mt-4 text-[#758045] hover:text-[#1C220E] font-semibold hover:underline">
          Browse All Services
        </Link>
      </div>
    );
  }

  const isOwner = user && (user._id === gig.provider?._id || user.id === gig.provider?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link to="/explore" className="hover:text-slate-900">Services</Link>
        <span>/</span>
        <Link to={`/explore?category=${gig.category}`} className="text-[#1C220E] hover:text-[#758045] font-bold">
          {gig.category}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Gig Info & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {gig.title}
            </h1>

            {/* Provider Quick Info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <Link
                to={`/profile/${gig.provider?._id}`}
                className="flex items-center gap-2 hover:text-slate-900 transition group"
              >
                {gig.provider?.profilePhoto ? (
                  <img
                    src={gig.provider.profilePhoto}
                    alt={gig.provider.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-[#9EA96F]/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-[10px] font-bold shadow-xs">
                    {gig.provider?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-bold text-slate-800 group-hover:text-[#758045] transition">
                  {gig.provider?.name}
                </span>
                {gig.provider?.isVerified && <VerifiedBadge size="sm" />}
              </Link>

              <span>•</span>
              <RatingStars rating={gig.ratingAverage} count={gig.ratingCount} size="sm" />
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {gig.deliveryTime} {gig.deliveryTime === 1 ? 'day' : 'days'} delivery
              </span>
            </div>
          </div>

          {/* Cover Media Preview */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 h-80 sm:h-96 w-full bg-slate-100 shadow-sm">
            {gig.coverImage ? (
              <img
                src={gig.coverImage}
                alt={gig.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Layers className="w-16 h-16" />
                <span className="text-sm mt-2 text-slate-500">Service Demonstration</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
              About This Service
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {gig.description}
            </p>

            {gig.tags?.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Keywords & Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Provider Profile Summary Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase mb-4">
              About the Provider
            </h3>

            <div className="flex items-start gap-4">
              {gig.provider?.profilePhoto ? (
                <img
                  src={gig.provider.profilePhoto}
                  alt={gig.provider.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#9EA96F]/25 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-xl font-bold shrink-0 shadow-xs">
                  {gig.provider?.name?.[0]?.toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#1C220E]">{gig.provider?.name}</h4>
                  {gig.provider?.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-xs font-semibold text-[#758045]">{gig.provider?.title || 'Freelancer'}</p>
                <p className="text-xs text-[#1C220E]/70 line-clamp-3 leading-relaxed mt-1">
                  {gig.provider?.bio || 'Verified provider on Vortex marketplace.'}
                </p>

                <div className="pt-2">
                  <Link
                    to={`/profile/${gig.provider?._id}`}
                    className="text-xs font-bold text-[#758045] hover:text-[#1C220E] inline-flex items-center gap-1 transition"
                  >
                    <span>View full profile & portfolio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1C220E] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#CDDE42] fill-[#CDDE42]" />
                <span>Client Reviews ({reviews.length})</span>
              </h3>
              <RatingStars rating={gig.ratingAverage} count={gig.ratingCount} size="md" />
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                No reviews yet for this listing. Be the first to book!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                          {r.reviewer?.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{r.reviewer?.name || 'Client'}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <RatingStars rating={r.rating} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Sticky Booking & Escrow Card */}
        <div>
          <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Fixed Price</span>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900">₹{gig.price.toLocaleString()}</span>
                <span className="text-xs text-slate-400 block">INR</span>
              </div>
            </div>

            <div className="space-y-3 py-4 border-y border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-[#758045]" />
                  Delivery Time
                </span>
                <span className="font-bold text-slate-900">
                  {gig.deliveryTime} {gig.deliveryTime === 1 ? 'day' : 'days'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-[#758045]" />
                  Service Category
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">{gig.category}</span>
              </div>
            </div>

            {/* Escrow Guarantee Highlight */}
            <div className="p-4 rounded-2xl bg-[#FAF9EE] border border-[#9EA96F]/30 flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#758045] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-[#1C220E]">
                <span className="font-bold text-[#1C220E] block mb-0.5">Vortex Escrow Protection</span>
                Your payment is locked safely in escrow when accepted. Funds are only released when you approve the final delivery.
              </div>
            </div>

            {/* Booking CTA Button */}
            {isOwner ? (
              <div className="p-3 bg-[#FAF9EE] border border-[#9EA96F]/30 rounded-xl text-center text-xs text-[#1C220E]/70 font-medium">
                You created this gig listing
              </div>
            ) : (
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="w-full py-3.5 px-4 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Book Service Now</span>
                <ArrowRight className="w-4 h-4 text-[#CDDE42]" />
              </button>
            )}

            <p className="text-[11px] text-center text-slate-500">
              Provider responds within 24 hours. No upfront payment until booking is accepted.
            </p>
          </div>
        </div>
      </div>

      {/* Book Service Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={`Book "${gig.title}"`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleBookOrder} className="space-y-4">
          {orderError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{orderError}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Price</span>
              <span className="text-xl font-black text-slate-900">₹{gig.price.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Delivery</span>
              <span className="text-xs font-bold text-slate-700">{gig.deliveryTime} Days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Project Requirements & Brief
            </label>
            <textarea
              rows={4}
              required
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe what you want built, your deadlines, deliverables, and any specific assets or references..."
              className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-[#CDDE42] focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none resize-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="px-5 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <span>{isSubmittingOrder ? 'Submitting...' : 'Send Commission Request'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#CDDE42]" />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
