import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../components/common/Toast';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('prompthub_token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/api/auth/me');
        const data = await res.json();

        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('prompthub_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!data.success) {
        if (addToast) addToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message || 'Login failed' };
      }

      localStorage.setItem('prompthub_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (addToast) addToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true, user: data.user };
    } catch (err) {
      if (addToast) addToast('Network error during login.', 'error');
      return { success: false, message: 'Network error during login.' };
    }
  };

  const register = async (name, email, password, role = 'user', photoURL = '') => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, photoURL })
      });
      const data = await res.json();

      if (!data.success) {
        if (addToast) addToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message || 'Registration failed' };
      }

      localStorage.setItem('prompthub_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (addToast) addToast('Account registered successfully!', 'success');
      return { success: true, user: data.user };
    } catch (err) {
      if (addToast) addToast('Network error during registration.', 'error');
      return { success: false, message: 'Network error during registration.' };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(googleData)
      });
      const data = await res.json();

      if (!data.success) {
        if (addToast) addToast(data.message || 'Google login failed', 'error');
        return { success: false, message: data.message || 'Google login failed' };
      }

      localStorage.setItem('prompthub_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (addToast) addToast(`Signed in with Google as ${data.user.name}`, 'success');
      return { success: true, user: data.user };
    } catch (err) {
      if (addToast) addToast('Google auth network error.', 'error');
      return { success: false, message: 'Google auth network error.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('prompthub_token');
    setToken(null);
    setUser(null);
    addToast('Logged out successfully.', 'info');
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        addToast(data.message, 'success');
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout, updateUserProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
