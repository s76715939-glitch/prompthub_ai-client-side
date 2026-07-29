import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Zap, 
  Lock, 
  Sparkles, 
  ArrowLeft,
  Crown,
  CheckCircle2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { apiFetch } from '../utils/api';

export const Payment = ({ navigate }) => {
  const { user, token, setUser } = useAuth();
  const { addToast } = useToast();

  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Check URL search params for Stripe Checkout callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const isSuccess = urlParams.get('success');
    const isCanceled = urlParams.get('canceled');

    if (isCanceled) {
      addToast('Stripe Checkout was cancelled.', 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (sessionId && isSuccess === 'true' && token) {
      const verifyStripePayment = async () => {
        setVerifying(true);
        try {
          const res = await apiFetch('/api/payments/verify-session', {
            method: 'POST',
            body: JSON.stringify({ sessionId })
          });
          const data = await res.json();
          if (data.success) {
            addToast('Stripe Payment Verified! Premium Membership Activated.', 'success');
            if (data.user) {
              setUser(prev => ({
                ...prev,
                subscription: 'premium'
              }));
            }
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => {
              navigate('/dashboard/user');
            }, 1500);
          } else {
            addToast(data.message || 'Payment verification failed.', 'error');
          }
        } catch (err) {
          addToast('Error verifying Stripe payment session.', 'error');
        } finally {
          setVerifying(false);
        }
      };
      verifyStripePayment();
    }
  }, [token]);

  const handleStripeCheckout = async (e) => {
    if (e) e.preventDefault();

    if (!token) {
      addToast('Please log in before upgrading to Premium.', 'info');
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);
      const res = await apiFetch('/api/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_1Ty28I2LKmokUIDuzdUL1eQS'
        })
      });

      const data = await res.json();

      if (data.success && data.url) {
        addToast('Redirecting to official Stripe Checkout page...', 'info');
        window.location.href = data.url;
      } else {
        addToast(data.message || 'Could not initiate Stripe Checkout session.', 'error');
        setProcessing(false);
      }
    } catch (err) {
      addToast('Network error while connecting to Stripe Checkout.', 'error');
      setProcessing(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Verifying Stripe Payment</h2>
            <p className="text-xs text-slate-400">Please hold tight while we confirm your payment with Stripe servers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-400">
            <Crown className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Administrator Account</h2>
            <p className="text-xs text-slate-300">
              As a platform administrator, you automatically possess unrestricted lifetime Premium access to all prompts, metrics, and tools across PromptHub AI.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/admin')}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            Return to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (user?.subscription === 'premium') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Premium Membership Active</h2>
            <p className="text-xs text-slate-300">
              You are already a Premium member! You have full lifetime access to private prompt blueprints, unlimited submissions, and priority features.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/prompts')}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all"
            >
              Explore Prompts
            </button>
            <button
              onClick={() => navigate(user?.role === 'creator' ? '/dashboard/creator' : '/dashboard/user')}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Navigation back */}
        <button
          onClick={() => navigate('/prompts')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {/* Page Heading */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Lifetime Premium Upgrade</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Unlock Full Access to All Premium AI Prompts
          </h1>
          <p className="text-slate-400 text-xs">
            One-time secure $5 payment. No monthly recurring subscriptions.
          </p>
        </div>

        {/* Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Plan Summary Card */}
          <div className="bg-slate-900/80 border border-amber-900/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48 text-amber-400" />
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  PromptHub AI Pro
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$5.00</span>
                  <span className="text-xs text-slate-400">/ One-time lifetime access</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Included Premium Features:
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant access to all Private & Premium prompt blueprints</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited prompt submissions in Creator & User dashboards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>One-click clipboard copy for complex multi-variable prompts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Community reviews, ratings & priority support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2 relative z-10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-Bit TLS Stripe Encrypted Checkout Guaranteed</span>
            </div>
          </div>

          {/* Stripe Checkout Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Stripe Payment
                </h3>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Instant Activation
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Plan</span>
                  <span className="text-xs font-semibold text-white">PromptHub Premium Lifetime</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Billing Interval</span>
                  <span className="text-xs font-medium text-slate-300">One-time payment</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-xs text-slate-300 font-semibold">Total Amount</span>
                  <span className="text-base font-black text-amber-400">$5.00 USD</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-indigo-950/40 border border-indigo-900/50 p-4 rounded-2xl">
                <p className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    You will be safely navigated to Stripe's secure payment page to enter your card, Google Pay, or Apple Pay details.
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleStripeCheckout}
                disabled={processing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Stripe Payment</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Guaranteed safe & encrypted transaction powered by Stripe.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
