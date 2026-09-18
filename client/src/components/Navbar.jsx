import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  User,
  LogOut,
  PlusCircle,
  Briefcase,
  Layers,
  Shield,
  Menu,
  X,
  Wallet,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { VerifiedBadge } from './Badge';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#FAF9EE]/90 backdrop-blur-md border-b border-[#9EA96F]/20 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#1C220E] text-[#CDDE42] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 fill-[#CDDE42]" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1C220E] font-display uppercase">
                VORTEX
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/explore"
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition ${
                  location.pathname === '/explore'
                    ? 'text-[#1C220E] bg-[#F2F6B1]'
                    : 'text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-[#F2F6B1]/50'
                }`}
              >
                Services
              </Link>
              <Link
                to="/freelancers"
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition ${
                  location.pathname === '/freelancers'
                    ? 'text-[#1C220E] bg-[#F2F6B1]'
                    : 'text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-[#F2F6B1]/50'
                }`}
              >
                Talent
              </Link>
              <Link
                to="/ai-match"
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition flex items-center gap-1.5 ${
                  location.pathname === '/ai-match'
                    ? 'text-[#1C220E] bg-[#F2F6B1]'
                    : 'text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-[#F2F6B1]/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8E9E38]" />
                <span>AI Match</span>
              </Link>
            </div>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Provider Quick Actions */}
                {user?.role === 'provider' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF9EE] border border-[#9EA96F]/30 text-[#1C220E]">
                      <Wallet className="w-3.5 h-3.5 text-[#758045]" />
                      <span>₹{(user.walletBalance || 0).toLocaleString()}</span>
                    </div>
                    <Link
                      to="/create-gig"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm transition bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE]"
                    >
                      <PlusCircle className="w-4 h-4 text-[#CDDE42]" />
                      <span>Post Service</span>
                    </Link>
                  </div>
                )}

                {/* Orders Link */}
                <Link
                  to="/orders"
                  className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition ${
                    location.pathname.startsWith('/orders')
                      ? 'bg-[#1C220E] text-[#CDDE42] shadow-sm'
                      : 'text-[#1C220E]/80 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40'
                  }`}
                >
                  Orders
                </Link>

                {/* Admin Link */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1C220E] bg-[#F2F6B1] border border-[#CDDE42] px-3 py-1.5 rounded-full hover:bg-[#E4EE7E] transition shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#758045]" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 text-[#1C220E]/70 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40 rounded-xl transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#CDDE42] text-[10px] font-black text-[#1C220E] rounded-full flex items-center justify-center ring-2 ring-[#FAF9EE]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-[#F2F6B1] border border-[#CDDE42] text-[#1C220E] px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#758045] hover:text-[#1C220E] hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) navigate(n.link);
                                setIsNotifOpen(false);
                              }}
                              className={`p-3 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                                !n.isRead ? 'bg-[#F2F6B1]/30' : ''
                              }`}
                            >
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-[#CDDE42] shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  {n.title}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-transparent hover:border-[#9EA96F]/20 hover:bg-[#F2F6B1]/30 transition text-[#1C220E]"
                  >
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#9EA96F]/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1C220E] text-[#CDDE42] flex items-center justify-center text-xs font-black shadow-xs">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#1C220E]/60" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-2 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {user?.role}
                          </span>
                          {user?.isVerified && <VerifiedBadge size="sm" />}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/profile/${user?._id || user?.id}`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40 transition"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Public Profile</span>
                        </Link>

                        {user?.role === 'provider' && (
                          <Link
                            to="/my-gigs"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40 transition"
                          >
                            <Layers className="w-4 h-4 text-slate-400" />
                            <span>My Services & Gigs</span>
                          </Link>
                        )}

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:text-[#1C220E] hover:bg-[#F2F6B1]/40 transition"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>Orders & Bookings</span>
                        </Link>

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#1C220E] hover:bg-[#F2F6B1]/40 transition font-semibold"
                          >
                            <Shield className="w-4 h-4 text-[#758045]" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-[#1C220E]/80 hover:text-[#1C220E] px-3.5 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold uppercase tracking-wider bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] px-5 py-2.5 rounded-full shadow-sm transition hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#1C220E] hover:bg-[#F2F6B1]/40 rounded-lg transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9EE] border-b border-[#9EA96F]/20 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <Link
            to="/explore"
            className="block px-3 py-2 text-sm font-semibold text-[#1C220E] hover:bg-[#F2F6B1]/40 rounded-lg"
          >
            Explore Services
          </Link>
          <Link
            to="/freelancers"
            className="block px-3 py-2 text-sm font-semibold text-[#1C220E] hover:bg-[#F2F6B1]/40 rounded-lg"
          >
            Top Talent
          </Link>
          <Link
            to="/ai-match"
            className="block px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-lg"
          >
            AI Resume Match (Preview)
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 text-xs text-slate-500">
                Logged in as <span className="text-slate-900 font-bold">{user?.name}</span> ({user?.role})
              </div>
              <Link
                to="/orders"
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                My Orders
              </Link>
              {user?.role === 'provider' && (
                <>
                  <Link
                    to="/my-gigs"
                    className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    My Gigs
                  </Link>
                  <Link
                    to="/create-gig"
                    className="block px-3 py-2 text-sm font-semibold text-[#758045] hover:bg-[#F2F6B1]/40 rounded-lg"
                  >
                    Post New Service
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-sm font-semibold text-[#1C220E] hover:bg-[#F2F6B1]/40 rounded-lg"
                >
                  Admin Portal
                </Link>
              )}
              <Link
                to={`/profile/${user?._id || user?.id}`}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-bold text-[#1C220E] bg-white border border-[#9EA96F]/25 rounded-xl hover:bg-[#F2F6B1]/30 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-bold text-[#FAF9EE] bg-[#1C220E] hover:bg-[#2E3514] rounded-xl shadow-md transition"
              >
                Join Vortex
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
