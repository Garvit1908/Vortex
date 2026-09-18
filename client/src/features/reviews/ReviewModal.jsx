import React, { useState } from 'react';
import { Star, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { RatingStars } from '../../components/RatingStars';
import api from '../../api/axios';

export const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a comment about your experience');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        orderId: order._id,
        rating,
        comment: comment.trim(),
      });

      if (res.data.success) {
        if (onReviewSubmitted) onReviewSubmitted(res.data.review);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Your Completed Order" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">Rate your collaboration with</p>
          <p className="text-base font-bold text-slate-900">{order?.provider?.name}</p>
          <div className="flex justify-center pt-2">
            <RatingStars
              rating={rating}
              size="lg"
              interactive={true}
              onSelect={(r) => setRating(r)}
            />
          </div>
          <span className="text-[11px] text-[#758045] font-bold block">
            {rating === 5 ? 'Exceptional 5/5' : rating === 4 ? 'Very Good 4/5' : rating === 3 ? 'Average 3/5' : 'Needs Improvement'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Detailed Review & Feedback
          </label>
          <textarea
            rows={4}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was it like working together? Mention communication, quality of deliverables, and timeliness..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-xs text-slate-800 outline-none resize-none transition"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
            className="px-5 py-2.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-[#CDDE42]" />
            <span>{isSubmitting ? 'Posting...' : 'Submit Verified Review'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};