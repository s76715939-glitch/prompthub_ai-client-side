import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/common/Skeleton';

// Pages
import { Home } from './pages/Home';
import { AllPrompts } from './pages/AllPrompts';
import { PromptDetails } from './pages/PromptDetails';
import { Payment } from './pages/Payment';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Dashboards
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { CreatorDashboard } from './pages/dashboard/CreatorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Helper route resolver
  const renderRoute = () => {
    const path = currentPath.toLowerCase();

    // Home Route
    if (path === '/' || path === '/home') {
      return <Home navigate={navigate} />;
    }

    // All Prompts Route
    if (path.startsWith('/prompts') && !path.includes('/prompts/')) {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSearch = urlParams.get('search') || '';
      return <AllPrompts navigate={navigate} initialSearch={initialSearch} />;
    }

    // Prompt Details Route
    if (path.startsWith('/prompts/')) {
      const parts = currentPath.split('/prompts/');
      const promptId = parts[1];
      return <PromptDetails promptId={promptId} navigate={navigate} />;
    }

    // Payment Route
    if (path === '/payment') {
      return <Payment navigate={navigate} />;
    }

    // Auth Routes
    if (path === '/login') {
      return <Login navigate={navigate} />;
    }
    if (path === '/register') {
      return <Register navigate={navigate} />;
    }

    // Dashboard Routes
    if (path.startsWith('/dashboard/user')) {
      if (authLoading) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner text="Loading dashboard..." />
          </div>
        );
      }
      if (!user) {
        return <Login navigate={navigate} />;
      }
      return <UserDashboard navigate={navigate} currentPath={currentPath} />;
    }

    if (path.startsWith('/dashboard/creator')) {
      if (authLoading) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner text="Verifying creator privileges..." />
          </div>
        );
      }
      if (!user) {
        return <Login navigate={navigate} />;
      }
      if (user.role !== 'creator' && user.role !== 'admin') {
        return <UserDashboard navigate={navigate} currentPath={currentPath} />;
      }
      return <CreatorDashboard navigate={navigate} currentPath={currentPath} />;
    }

    if (path.startsWith('/dashboard/admin')) {
      if (authLoading) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner text="Verifying admin credentials..." />
          </div>
        );
      }
      if (!user) {
        return <Login navigate={navigate} />;
      }
      if (user.role !== 'admin') {
        // Strict guard: normal users or creators CANNOT view or load admin page
        return <UserDashboard navigate={navigate} currentPath={currentPath} />;
      }
      return <AdminDashboard navigate={navigate} currentPath={currentPath} />;
    }

    // Default Fallback to Home
    return <Home navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans antialiased text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar navigate={navigate} currentPath={currentPath} />
      <div className="flex-1">
        {renderRoute()}
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
