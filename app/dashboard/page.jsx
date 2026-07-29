'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { 
  Package, 
  Download, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  Heart, 
  User, 
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { orders, wishlist, addToCart } = useCart();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams ? searchParams.get('payment') === 'success' : false;

  const [dbOrders, setDbOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDbOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data.orders && data.orders.length > 0) {
            setDbOrders(data.orders);
          }
        }
      } catch (err) {
        console.warn('Using local orders state');
      } finally {
        setLoading(false);
      }
    }

    fetchDbOrders();
  }, []);

  const allOrders = dbOrders.length > 0 ? dbOrders : orders;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-2 animate-slide-up shadow-xl">
          <div className="flex items-center gap-2 text-base font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Stripe Payment Confirmed & MongoDB Order Created!</span>
          </div>
          <p className="text-xs text-emerald-200/80">
            Thank you for your order! Your purchase details have been recorded in the MongoDB order schema. You can download project files directly below.
          </p>
        </div>
      )}

      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Student Account & Orders</h1>
            <p className="text-xs text-slate-400">sagormia6942@gmail.com • University Assignment Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Stack: Next.js + MongoDB + Stripe
          </span>
        </div>
      </div>

      {/* Orders History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Your Order History ({allOrders.length})</span>
          </h2>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Synced with MongoDB API Route</span>
          </span>
        </div>

        {allOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <Package className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No purchases found</h3>
            <p className="text-xs text-slate-400">Try placing a test order via Stripe checkout!</p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {allOrders.map((order, index) => (
              <div key={order._id || order.id || index} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono">Order ID: #{order._id || order.stripePaymentIntentId || index + 101}</span>
                    <span className="text-slate-500 block text-[10px]">
                      Customer: {order.customerName} ({order.customerEmail})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 uppercase text-[10px]">
                      {order.paymentStatus || 'paid'}
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items && order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg bg-slate-900"
                        />
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.quantity} • ${item.price}</p>
                        </div>
                      </div>

                      <a
                        href={item.downloadUrl || '#'}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulated Download Started: "${item.title}" source code .zip package!`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ZIP</span>
                      </a>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Wishlist Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" />
          <span>Saved Wishlist ({wishlist.length})</span>
        </h2>

        {wishlist.length === 0 ? (
          <p className="text-xs text-slate-400">No items in your wishlist.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              <div key={item.id || item._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div className="line-clamp-1 pr-2">
                  <p className="font-bold text-xs text-white line-clamp-1">{item.title}</p>
                  <p className="text-[11px] text-indigo-400 font-mono">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shrink-0"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
