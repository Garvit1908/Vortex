import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { FreelancersPage } from './pages/FreelancersPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Auth Features
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { ProtectedRoute, RoleRoute } from './features/auth/ProtectedRoute';

// Profile Features
import { ProfilePage } from './features/profile/ProfilePage';

// Listings Features
import { GigDetailPage } from './features/listings/GigDetailPage';
import { CreateGigPage } from './features/listings/CreateGigPage';
import { MyGigsPage } from './features/listings/MyGigsPage';

// Orders & Chat Features
import { OrdersListPage } from './features/orders/OrdersListPage';
import { OrderDetailPage } from './features/orders/OrderDetailPage';

// Admin Features
import { AdminDashboard } from './features/admin/AdminDashboard';

// AI Placeholder Feature
import { AIMatchingStub } from './features/ai-stub/AIMatchingStub';

import { useNotification } from './context/NotificationContext';
import { Bell, X } from 'lucide-react';

export const App = () => {
  const { toast, setToast } = useNotification();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9EE] text-[#1C220E] font-sans selection:bg-[#CDDE42] selection:text-[#1C220E]">
      {/* Top Navigation */}
      <Navbar />

      {/* Real-Time Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white p-4 rounded-2xl border border-[#9EA96F]/30 shadow-xl animate-slideIn flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#F2F6B1] text-[#758045] border border-[#CDDE42] shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-[#1C220E] truncate">{toast.title}</h5>
            <p className="text-[11px] text-[#1C220E]/70 mt-0.5 line-clamp-2 leading-relaxed">
              {toast.message}
            </p>
            {toast.link && (
              <Link
                to={toast.link}
                onClick={() => setToast(null)}
                className="text-[10px] font-bold text-[#758045] hover:text-[#1C220E] hover:underline mt-1.5 inline-block"
              >
                View Details →
              </Link>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/gigs/:id" element={<GigDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-match" element={<AIMatchingStub />} />

          {/* Protected Client/Provider Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Provider Specific Routes */}
          <Route
            path="/create-gig"
            element={
              <RoleRoute allowedRoles={['provider']}>
                <CreateGigPage />
              </RoleRoute>
            }
          />
          <Route
            path="/my-gigs"
            element={
              <RoleRoute allowedRoles={['provider']}>
                <MyGigsPage />
              </RoleRoute>
            }
          />

          {/* Admin Specific Route */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
