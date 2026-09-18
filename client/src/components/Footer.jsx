import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Lock, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#9EA96F]/20 bg-[#121609] text-[#FAF9EE]/75 text-sm">
      {/* Main Links Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#CDDE42] text-[#121609] flex items-center justify-center font-black">
              <Sparkles className="w-3.5 h-3.5 fill-[#121609]" />
            </div>
            <span className="text-xl font-black text-white tracking-tight uppercase font-display">
              VORTEX
            </span>
          </div>
          <p className="text-xs text-[#FAF9EE]/60 leading-relaxed max-w-sm">
            Curated marketplace connecting ambitious organizations with verified independent specialists backed by 100% escrow protection.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#CDDE42] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#CDDE42] animate-pulse" />
            <span>Escrow Protection Protocol Active</span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-widest text-[#CDDE42]">Categories</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/explore?category=Web Development" className="hover:text-white transition">Web Development</Link></li>
            <li><Link to="/explore?category=UI/UX & Design" className="hover:text-white transition">UI/UX Design</Link></li>
            <li><Link to="/explore?category=AI & Machine Learning" className="hover:text-white transition">AI & Machine Learning</Link></li>
            <li><Link to="/explore?category=DevOps & Cloud" className="hover:text-white transition">Cloud & DevOps</Link></li>
          </ul>
        </div>

        {/* Platform Column */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-widest text-[#CDDE42]">Platform</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/explore" className="hover:text-white transition">Explore Services</Link></li>
            <li><Link to="/freelancers" className="hover:text-white transition">Top Specialists</Link></li>
            <li><Link to="/ai-match" className="hover:text-white transition">AI Talent Matcher</Link></li>
            <li><Link to="/orders" className="hover:text-white transition">Order Dashboard</Link></li>
          </ul>
        </div>

        {/* Trust & Guarantees */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-widest text-[#CDDE42]">Guarantees</h5>
          <ul className="space-y-2 text-xs text-[#FAF9EE]/60">
            <li className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-[#CDDE42]" /> 100% Escrow Security</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-[#CDDE42]" /> Verified Providers</li>
            <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#CDDE42]" /> Direct Order Chat</li>
            <li>Fair Dispute Resolution</li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF9EE]/40 gap-2">
        <p>© {new Date().getFullYear()} Vortex Marketplace. All rights reserved.</p>
        <p className="font-mono text-[11px] tracking-wider uppercase">
          Precision • Discretion • Execution
        </p>
      </div>
    </footer>
  );
};
