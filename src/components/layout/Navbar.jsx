import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Menu, 
  X,
  Compass,
  Crown,
  ShieldAlert
} from 'lucide-react';

export const Navbar = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/dashboard/user';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'creator') return '/dashboard/creator';
    return '/dashboard/user';
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 border-b border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            PromptHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNav('/')}
            className={`text-sm font-medium transition-colors ${
              currentPath === '/' ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('/prompts')}
            className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentPath === '/prompts' ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            All Prompts
          </button>
        </div>

        {/* Right Action Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 transition-colors text-left"
              >
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-200 line-clamp-1">{user.name}</div>
                  <div className="flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      user.role === 'admin' ? 'bg-rose-400' : user.role === 'creator' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <span className="capitalize text-slate-400 text-[10px]">{user.role}</span>
                    {user.subscription === 'premium' && (
                      <Crown className="w-3 h-3 text-amber-400 inline ml-0.5" />
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800/60">
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50 uppercase">
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        user.subscription === 'premium' 
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {user.subscription}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {user.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => handleNav('/dashboard/admin')}
                          className="w-full text-left px-4 py-2 text-sm text-amber-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          Admin Dashboard
                        </button>
                        <button
                          onClick={() => handleNav('/dashboard/user')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                          User Dashboard
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleNav(getDashboardRoute())}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        Dashboard
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('/login')}
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => handleNav('/')}
            className="block w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('/prompts')}
            className="block w-full text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
          >
            All Prompts
          </button>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <button
                    onClick={() => handleNav('/dashboard/admin')}
                    className="block w-full text-left px-3 py-2 rounded-lg bg-amber-950/60 text-amber-300 font-semibold"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('/dashboard/user')}
                    className="block w-full text-left px-3 py-2 rounded-lg bg-indigo-950/60 text-indigo-300 font-semibold"
                  >
                    User Dashboard
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNav(getDashboardRoute())}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-indigo-950/60 text-indigo-300 font-semibold"
                >
                  Dashboard ({user.role})
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleNav('/login')}
                className="w-full py-2.5 rounded-xl border border-slate-800 text-center font-medium text-slate-200"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-center font-semibold text-white"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
