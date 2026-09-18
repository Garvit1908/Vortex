import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  Briefcase,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const { sendSignupOtp, verifyOtpAndRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Step 1 vs Step 2
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [otp, setOtp] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendSignupOtp(email.trim());
      setSuccessMsg(`A 6-digit verification code was sent to ${email.trim()}`);
      setResendCooldown(30);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await sendSignupOtp(email.trim());
      setSuccessMsg(`New verification code sent to ${email.trim()}`);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP & Register
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtpAndRegister({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        otp: otp.trim(),
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed');
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
          <h2 className="text-3xl font-extrabold text-[#1C220E] tracking-tight">
            {step === 1 ? 'Join Vortex' : 'Verify Your Email'}
          </h2>
          <p className="text-sm text-[#1C220E]/70 mt-2">
            {step === 1
              ? 'Create a secure account with one-time verification'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-[#9EA96F]/30 shadow-xl space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Status Message */}
          {successMsg && step === 2 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Details & Role Selection */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1.5 ${
                      role === 'client'
                        ? 'border-[#CDDE42] bg-[#F2F6B1]/40 text-[#1C220E] ring-2 ring-[#CDDE42]/40 shadow-xs'
                        : 'border-[#9EA96F]/25 bg-[#FAF9EE]/50 text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-white'
                    }`}
                  >
                    <UserCheck
                      className={`w-5 h-5 ${role === 'client' ? 'text-[#758045]' : 'text-[#9EA96F]'}`}
                    />
                    <div>
                      <p className="text-xs font-bold">Hire Freelancers</p>
                      <p className="text-[10px] text-[#1C220E]/60">Client role</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1.5 ${
                      role === 'provider'
                        ? 'border-[#CDDE42] bg-[#F2F6B1]/40 text-[#1C220E] ring-2 ring-[#CDDE42]/40 shadow-xs'
                        : 'border-[#9EA96F]/25 bg-[#FAF9EE]/50 text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-white'
                    }`}
                  >
                    <Briefcase
                      className={`w-5 h-5 ${role === 'provider' ? 'text-[#758045]' : 'text-[#9EA96F]'}`}
                    />
                    <div>
                      <p className="text-xs font-bold">Offer Services</p>
                      <p className="text-[10px] text-[#1C220E]/60">Freelancer role</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#9EA96F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full pl-11 pr-4 py-2.5 bg-[#FAF9EE]/50 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 rounded-xl text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition"
                  />
                </div>
              </div>

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
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#9EA96F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
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
                className="w-full py-3.5 px-4 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] text-sm font-bold rounded-xl shadow-md transition mt-4 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Sending Code...' : 'Send Verification Code'}</span>
                <ArrowRight className="w-4 h-4 text-[#CDDE42]" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
              {/* Email Chip & Change button */}
              <div className="p-3 bg-[#FAF9EE] border border-[#9EA96F]/30 rounded-2xl flex items-center justify-between text-xs">
                <div className="truncate max-w-[220px]">
                  <span className="text-[#1C220E]/60 block text-[10px]">Verification Target</span>
                  <span className="font-bold text-[#1C220E] truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#758045] hover:text-[#1C220E] font-bold text-xs flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full py-3 bg-white border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:ring-2 focus:ring-[#CDDE42]/20 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] text-[#1C220E] outline-none transition font-bold"
                  />
                </div>
                <span className="text-[11px] text-[#1C220E]/60 text-center block mt-1.5">
                  Code expires in 10 minutes
                </span>
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="w-full py-3.5 px-4 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Verify & Complete Signup'}</span>
                <CheckCircle2 className="w-4 h-4 text-[#CDDE42]" />
              </button>

              {/* Resend Link with Cooldown */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={handleResendOtp}
                  className="text-xs text-[#1C220E]/60 hover:text-[#1C220E] font-semibold disabled:opacity-50 transition inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend Verification Code'}
                  </span>
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#9EA96F]/20">
            <p className="text-xs text-[#1C220E]/70">
              Already have an account?{' '}
              <Link to="/login" className="text-[#758045] hover:text-[#1C220E] font-bold underline transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};