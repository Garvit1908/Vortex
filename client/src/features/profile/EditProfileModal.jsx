import React, { useState } from 'react';
import { Plus, Trash2, Save, Upload } from 'lucide-react';
import { Modal } from '../../components/Modal';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [hourlyRate, setHourlyRate] = useState(user?.pricing?.hourlyRate || '');
  const [startingAt, setStartingAt] = useState(user?.pricing?.startingAt || '');
  const [portfolioLinks, setPortfolioLinks] = useState(
    user?.portfolioLinks || [{ title: '', url: '' }]
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addPortfolioItem = () => {
    setPortfolioLinks([...portfolioLinks, { title: '', url: '' }]);
  };

  const removePortfolioItem = (index) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const updatePortfolioItem = (index, field, value) => {
    const updated = [...portfolioLinks];
    updated[index][field] = value;
    setPortfolioLinks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // 1. Update text fields
      const res = await api.put('/users/profile', {
        name,
        title,
        bio,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        pricing: {
          hourlyRate: Number(hourlyRate) || 0,
          startingAt: Number(startingAt) || 0,
        },
        portfolioLinks: portfolioLinks.filter((p) => p.title && p.url),
      });

      let updatedUserData = res.data.user;

      // 2. Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await api.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedUserData = avatarRes.data.user;
      }

      updateUser(updatedUserData);
      if (onProfileUpdated) onProfileUpdated(updatedUserData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Profile Photo Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              id="avatar-input"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="avatar-input"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-2 border border-slate-200 transition"
            >
              <Upload className="w-4 h-4 text-[#758045]" />
              <span>Choose Photo</span>
            </label>
            {avatarFile ? (
              <span className="text-xs text-[#758045] font-medium truncate max-w-xs">
                {avatarFile.name}
              </span>
            ) : (
              <span className="text-xs text-slate-400">Supports JPG, PNG, WEBP</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-slate-800 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Professional Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-slate-800 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Bio / Summary
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your expertise, achievements, and work style..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-slate-800 outline-none resize-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Skills (comma separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Node.js, Tailwind CSS, TypeScript, Docker"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-slate-800 outline-none transition"
          />
        </div>

        {/* Pricing for Freelancers */}
        {user?.role === 'provider' && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="2500"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-[#CDDE42]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Starting Project Price (₹)
              </label>
              <input
                type="number"
                value={startingAt}
                onChange={(e) => setStartingAt(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-[#CDDE42]"
              />
            </div>
          </div>
        )}

        {/* Portfolio Links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Portfolio & Project Links
            </label>
            <button
              type="button"
              onClick={addPortfolioItem}
              className="text-xs text-[#758045] hover:text-[#1C220E] font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          <div className="space-y-2">
            {portfolioLinks.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => updatePortfolioItem(idx, 'title', e.target.value)}
                  placeholder="Project Title"
                  className="w-1/3 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-[#CDDE42]"
                />
                <input
                  type="url"
                  value={p.url}
                  onChange={(e) => updatePortfolioItem(idx, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-[#CDDE42]"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioItem(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5 text-[#CDDE42]" />
            <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};