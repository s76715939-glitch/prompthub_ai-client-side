'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Mail, 
  FileText, 
  ShoppingBag,
  Sparkles,
  Database
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, addOrder, mongoStatus } = useCart();

  const [customerName, setCustomerName] = useState('Sagor Mia');
  const [customerEmail, setCustomerEmail] = useState('sagormia6942@gmail.com');
  const [orderNotes, setOrderNotes] = useState('University Assignment Project Download');
  
  // Card Form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">No items in cart for checkout</h2>
        <button
          onClick={() => router.push('/products')}
          className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // POST to Node.js /api/checkout endpoint
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerName,
          customerEmail,
          orderNotes,
          isSimulated: true, // Allows seamless testing without requiring real Stripe live keys
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.mode === 'stripe_live' && data.url) {
          window.location.href = data.url;
          return;
        }

        // Add confirmed order to cart state / localStorage / MongoDB
        addOrder(data.order || {
          customerName,
          customerEmail,
          items: cart,
          totalAmount: cartTotal,
          paymentMethod: 'stripe_card_test',
          stripePaymentIntentId: data.transactionId || `pi_test_${Date.now()}`,
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
        });

        router.push('/dashboard?payment=success');
      } else {
        setError(data.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Stripe Payment Integration Gateway</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Checkout</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter customer information and process payment via Stripe API route
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Info & Card */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCheckout} className="space-y-6">
            
            {/* Customer Details Box */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>1. Customer & Delivery Info</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-medium">Assignment Order Notes</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Stripe Card Box */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>2. Stripe Credit / Debit Card</span>
                </h2>
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20"
                >
                  Use Stripe Test Card (4242)
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">CVC / CVV</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Communicating with Stripe API Route...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${cartTotal.toFixed(2)} with Stripe</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Order Items ({cart.length})</span>
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id || item._id} className="flex items-center justify-between text-xs">
                  <div className="line-clamp-1 pr-2">
                    <p className="font-semibold text-slate-200 line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between font-bold text-white text-sm">
                <span>Total Due</span>
                <span className="text-indigo-400">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* MongoDB Saving Notice */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Database className="w-3.5 h-3.5" />
                <span>MongoDB Mongoose Order Logging</span>
              </div>
              <p>
                Upon payment confirmation, order details will be saved to MongoDB database schema via Node.js backend.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
