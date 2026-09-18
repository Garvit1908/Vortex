import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F2F6B1] border border-[#CDDE42] text-[#1C220E] mb-3 shadow-xs">
            <Sparkles className="w-6 h-6 text-[#758045]" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1C220E] tracking-tight">Welcome to Vortex</h2>
          <p className="text-sm text-[#1C220E]/70 mt-2">
            Sign in to access your escrow bookings, chats, and services
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-[#9EA96F]/30 shadow-xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#9EA96F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF9EE]/50 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#9EA96F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF9EE]/50 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] text-sm font-bold rounded-xl shadow-md transition mt-2"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-[#CDDE42]" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#9EA96F]/20">
            <p className="text-xs text-[#1C220E]/70">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#758045] hover:text-[#1C220E] font-bold underline transition">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
