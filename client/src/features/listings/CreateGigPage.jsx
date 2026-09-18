import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, Layers, AlertCircle, Check } from 'lucide-react';
import api from '../../api/axios';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX & Design',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Audio',
];

export const CreateGigPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(3);
  const [tags, setTags] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);

    const formData = new FormData();
    formData.append('cover', file);

    try {
      const res = await api.post('/gigs/upload-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setCoverImageUrl(res.data.url);
      }
    } catch (err) {
      setError('Failed to upload cover image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(price) < 50) {
      setError('Minimum price must be at least ₹50');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/gigs', {
        title,
        category,
        description,
        price: Number(price),
        deliveryTime: Number(deliveryTime),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage: coverImageUrl,
      });

      if (res.data.success) {
        navigate(`/gigs/${res.data.gig._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C220E] tracking-tight flex items-center gap-2">
          <PlusCircle className="w-8 h-8 text-[#758045]" />
          <span>Publish a New Service</span>
        </h1>
        <p className="text-sm text-[#1C220E]/70 mt-1">
          Showcase your expertise to clients seeking top-tier freelance talent on Vortex.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#9EA96F]/20 shadow-xl">
        {error && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gig Title */}
          <div>
            <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
              Service Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a High-Performance Full-Stack React & Node.js Application"
              className="w-full px-4 py-3 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition"
            />
          </div>

          {/* Category & Delivery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white rounded-xl text-sm text-[#1C220E] outline-none transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
                Expected Delivery (Days)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white rounded-xl text-sm text-[#1C220E] outline-none transition"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
              Fixed Starting Price (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min={50}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000"
                className="w-full pl-9 pr-4 py-3 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] outline-none font-bold transition"
              />
            </div>
            <span className="text-[11px] text-[#1C220E]/60 mt-1 block">
              Clients deposit this amount into escrow when booking is accepted.
            </span>
          </div>

          {/* Cover Media Image */}
          <div>
            <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
              Cover Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="px-4 py-3 bg-[#FAF9EE] hover:bg-[#F2F6B1]/40 text-[#1C220E] rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-2 border border-[#9EA96F]/30 transition shadow-xs">
                <Upload className="w-4 h-4 text-[#758045]" />
                <span>Upload Media Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-[#1C220E]/60">or paste an image URL:</span>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 w-full px-4 py-2.5 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white rounded-xl text-xs text-[#1C220E] outline-none transition"
              />
            </div>

            {coverImageUrl && (
              <div className="mt-3 h-36 w-full rounded-2xl overflow-hidden border border-[#9EA96F]/20 bg-slate-50">
                <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
              Detailed Description & Deliverables
            </label>
            <textarea
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what is included, your workflow, requirements from the client, and final deliverable formats..."
              className="w-full px-4 py-3 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none resize-none transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
              Tags / Keywords (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, TypeScript, Redux, Tailwind, API"
              className="w-full px-4 py-3 bg-[#FAF9EE]/40 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition"
            />
          </div>

          <div className="pt-4 border-t border-[#9EA96F]/15 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] font-bold text-sm rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-[#CDDE42]" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Service Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};