import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, count = null, size = 'sm', interactive = false, onSelect = null }) => {
  const iconSize = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <button
            type="button"
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onSelect && onSelect(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${iconSize} ${
                isFilled
                  ? 'fill-[#CDDE42] text-[#CDDE42]'
                  : 'fill-transparent text-slate-300'
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && !interactive && (
        <span className="ml-1 text-xs font-bold text-slate-800">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-xs text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
};
