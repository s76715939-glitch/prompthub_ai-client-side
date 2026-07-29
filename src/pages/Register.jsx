import React, { useState } from 'react';
import { User, Mail, Lock, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export const Register = ({ navigate }) => {
  const { register, googleLogin } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const triggerGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUser = await userInfoRes.json();

        const res = await googleLogin({
          name: googleUser.name || name || 'Google User',
          email: googleUser.email,
          photoURL: googleUser.picture || photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          googleId: googleUser.sub,
          role: role || 'user'
        });

        if (res.success) {
          if (res.user.role === 'admin') {
            navigate('/dashboard/admin');
          } else if (res.user.role === 'creator') {
            navigate('/dashboard/creator');
          } else {
            navigate('/dashboard/user');
          }
        } else {
          addToast(res.message || 'Google Registration failed.', 'error');
        }
      } catch (err) {
        console.error('Google OAuth error:', err);
        addToast('Failed to retrieve user info from Google.', 'error');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google Register error:', err);
      addToast('Google Sign-Up was cancelled or failed.', 'error');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in name, email, and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register(name, email, password, role, photoURL);
      if (res.success) {
        if (role === 'creator') {
          navigate('/dashboard/creator');
        } else {
          navigate('/dashboard/user');
        }
      } else {
        addToast(res.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      addToast('An error occurred during registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join PromptHub AI</h2>
          <p className="text-xs text-slate-400">Discover and engineer world-class AI prompts for modern LLMs.</p>
        </div>

        {/* Google Sign-Up Button */}
        <button
          onClick={() => triggerGoogleRegister()}
          disabled={googleLoading}
          className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800/80 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Signing up with Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-medium absolute">or sign up with email</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="user">Prompt Explorer / User</option>
              <option value="creator">Prompt Engineer / Creator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Photo URL (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-400 hover:underline font-semibold"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
