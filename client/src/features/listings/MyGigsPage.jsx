import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Layers, Trash2, Eye, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import { RatingStars } from '../../components/RatingStars';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const MyGigsPage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGigs = async () => {
    try {
      const res = await api.get('/gigs/my/listings');
      if (res.data.success) {
        setGigs(res.data.gigs);
      }
    } catch (err) {
      console.error('Failed to fetch my gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const handleDelete = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) return;
    try {
      await api.delete(`/gigs/${gigId}`);
      setGigs(gigs.filter((g) => g._id !== gigId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete gig');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your service listings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Services & Gigs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your service offerings, prices, and public listings
          </p>
        </div>

        <Link
          to="/create-gig"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] text-xs font-bold rounded-full uppercase tracking-wider shadow-sm transition self-start"
        >
          <PlusCircle className="w-4 h-4 text-[#CDDE42]" />
          <span>Publish New Service</span>
        </Link>
      </div>

      {gigs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#9EA96F]/20 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F2F6B1] border border-[#CDDE42] text-[#1C220E] flex items-center justify-center mx-auto shadow-xs">
            <Layers className="w-6 h-6 text-[#758045]" />
          </div>
          <h3 className="text-lg font-bold text-[#1C220E]">No services listed yet</h3>
          <p className="text-xs text-[#1C220E]/70 max-w-sm mx-auto">
            Create your first gig to start receiving orders and secure escrow payments from clients.
          </p>
          <Link
            to="/create-gig"
            className="inline-block text-xs font-bold text-[#758045] hover:text-[#1C220E] underline pt-2 transition"
          >
            Create a Service Now →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-2xl border border-[#9EA96F]/20 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                {gig.coverImage ? (
                  <img src={gig.coverImage} alt={gig.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Layers className="w-8 h-8" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FAF9EE] text-[#1C220E] border border-[#9EA96F]/30 shadow-xs">
                  {gig.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1C220E] line-clamp-2">{gig.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <RatingStars rating={gig.ratingAverage} count={gig.ratingCount} size="sm" />
                    <span className="text-sm font-black text-[#1C220E]">₹{gig.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#9EA96F]/15 flex items-center justify-between">
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#758045] transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#758045]" />
                    <span>View Public Page</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(gig._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
