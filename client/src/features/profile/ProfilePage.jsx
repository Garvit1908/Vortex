import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Mail,
  ExternalLink,
  Edit3,
  Calendar,
  Layers,
  Star,
  CheckCircle,
  Briefcase,
  Shield,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { VerifiedBadge } from '../../components/Badge';
import { RatingStars } from '../../components/RatingStars';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EditProfileModal } from './EditProfileModal';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOwner = currentUser && (currentUser._id === id || currentUser.id === id);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      if (res.data.success) {
        setProfile(res.data.user);
        setGigs(res.data.gigs || []);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">The user profile you requested does not exist.</p>
        <Link to="/" className="inline-block mt-4 text-[#758045] hover:text-[#1C220E] font-semibold hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-[#9EA96F]/20 shadow-sm mb-8">
        <div className="h-36 sm:h-48 bg-gradient-to-r from-[#9EA96F]/20 via-[#F2F6B1]/30 to-[#FAF9EE] border-b border-[#9EA96F]/20" />

        <div className="px-6 sm:px-8 pb-8 -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-slate-100"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-4xl font-extrabold ring-4 ring-white shadow-xl">
                {profile.name[0]?.toUpperCase()}
              </div>
            )}

            {/* Name & Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C220E] tracking-tight">
                  {profile.name}
                </h1>
                {profile.isVerified && <VerifiedBadge size="md" />}
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF9EE] text-[#1C220E] border border-[#9EA96F]/30">
                  {profile.role}
                </span>
              </div>

              {profile.title && (
                <p className="text-sm font-semibold text-[#758045] mt-1">{profile.title}</p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                {profile.role === 'provider' && (
                  <RatingStars rating={profile.ratingAverage} count={profile.ratingCount} size="sm" />
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {isOwner && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition"
            >
              <Edit3 className="w-4 h-4 text-[#758045]" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout: Left Details, Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sidebar details */}
        <div className="space-y-6">
          {/* Bio Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
              About
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profile.bio || 'No bio provided yet.'}
            </p>
          </div>

          {/* Pricing Info (if provider) */}
          {profile.role === 'provider' && (profile.pricing?.hourlyRate > 0 || profile.pricing?.startingAt > 0) && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                Service Rates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.pricing?.hourlyRate > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs text-slate-500">Hourly Rate</p>
                    <p className="text-lg font-black text-slate-900 mt-1">₹{profile.pricing.hourlyRate}</p>
                  </div>
                )}
                {profile.pricing?.startingAt > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <p className="text-xs text-slate-500">Starting At</p>
                    <p className="text-lg font-black text-[#1C220E] mt-1">₹{profile.pricing.startingAt}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills Tags */}
          {profile.skills?.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C220E] mb-3">
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#F2F6B1]/40 border border-[#CDDE42] text-[#1C220E] text-xs font-semibold rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio & Project Links */}
          {profile.portfolioLinks?.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-[#9EA96F]/20 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C220E] mb-3">
                Featured Work
              </h3>
              <div className="space-y-2.5">
                {profile.portfolioLinks.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9EE]/50 hover:bg-[#F2F6B1]/30 border border-[#9EA96F]/20 text-xs text-[#1C220E] hover:text-[#1C220E] transition group"
                  >
                    <span className="font-semibold truncate">{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9EA96F] group-hover:text-[#758045] shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Services & Reviews (if provider) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services/Gigs Offered */}
          {profile.role === 'provider' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#758045]" />
                  <span>Available Services ({gigs.length})</span>
                </h2>
                {isOwner && (
                  <Link
                    to="/create-gig"
                    className="text-xs font-semibold text-[#758045] hover:text-[#1C220E] hover:underline"
                  >
                    + Add New Service
                  </Link>
                )}
              </div>

              {gigs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#9EA96F]/20 shadow-sm text-slate-400 text-sm">
                  No active services listed yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gigs.map((gig) => (
                    <Link
                      key={gig._id}
                      to={`/gigs/${gig._id}`}
                      className="bg-white hover:border-[#CDDE42] p-4 rounded-2xl border border-[#9EA96F]/20 shadow-sm hover:shadow-md block group transition"
                    >
                      <div className="h-36 rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                        {gig.coverImage ? (
                          <img
                            src={gig.coverImage}
                            alt={gig.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <Layers className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FAF9EE] text-[#1C220E] border border-[#9EA96F]/30 shadow-xs">
                          {gig.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#1C220E] group-hover:text-[#758045] transition line-clamp-2">
                        {gig.title}
                      </h4>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#9EA96F]/15">
                        <RatingStars rating={gig.ratingAverage} count={gig.ratingCount} size="sm" />
                        <span className="text-sm font-extrabold text-[#1C220E]">₹{gig.price.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Client Reviews Section */}
          {profile.role === 'provider' && (
            <div>
              <h2 className="text-lg font-bold text-[#1C220E] flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#CDDE42] fill-[#CDDE42]" />
                <span>Client Reviews & Endorsements ({reviews.length})</span>
              </h2>

              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#9EA96F]/20 shadow-sm text-slate-400 text-sm">
                  No reviews received yet. Reviews appear once orders are completed!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="bg-white p-5 rounded-2xl border border-[#9EA96F]/20 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {rev.reviewer?.profilePhoto ? (
                            <img
                              src={rev.reviewer.profilePhoto}
                              alt={rev.reviewer.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-xs font-bold shadow-sm">
                              {rev.reviewer?.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900">{rev.reviewer?.name || 'Verified Client'}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} size="sm" />
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={profile}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}
    </div>
  );
};
