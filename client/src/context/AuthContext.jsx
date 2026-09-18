import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vortex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vortex_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('vortex_token', token);
    } else {
      localStorage.removeItem('vortex_token');
    }
  }, [token]);

  // Sync user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('vortex_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vortex_user');
    }
  }, [user]);

  // Fetch current user details on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('vortex_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session check error, attempting refresh...');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const sendSignupOtp = async (email) => {
    const res = await api.post('/auth/send-otp', { email });
    if (res.data.success) {
      return res.data;
    }
    throw new Error(res.data.message || 'Failed to send verification code');
  };

  const verifyOtpAndRegister = async ({ name, email, password, role, otp }) => {
    const res = await api.post('/auth/verify-otp', { name, email, password, role, otp });
    if (res.data.success) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Verification failed');
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data.success) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('vortex_token');
      localStorage.removeItem('vortex_user');
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        sendSignupOtp,
        verifyOtpAndRegister,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
