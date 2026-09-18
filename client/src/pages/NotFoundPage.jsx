import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-[#F2F6B1] border border-[#CDDE42] text-[#1C220E] flex items-center justify-center mb-4 shadow-sm">
        <Sparkles className="w-8 h-8 text-[#758045]" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-[#1C220E] tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-[#1C220E] mt-2">Page Not Found</h2>
      <p className="text-xs text-[#1C220E]/70 max-w-sm mt-1">
        The route or service you are looking for has been relocated or is currently unreachable.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition"
      >
        <ArrowLeft className="w-4 h-4 text-[#CDDE42]" />
        <span>Return to Marketplace</span>
      </Link>
    </div>
  );
};
