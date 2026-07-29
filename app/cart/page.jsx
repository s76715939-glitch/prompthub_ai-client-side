'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Tag
} from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'ASSIGNMENT10' || promoCode.toUpperCase() === 'STUDENT') {
      setDiscount(0.15); // 15% discount
    } else {
      alert('Invalid promo code. Try "ASSIGNMENT10" for 15% off!');
    }
  };

  const finalTotal = cartTotal * (1 - discount);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            You haven't added any products or assignment projects to your cart yet.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review your items before proceeding to Stripe Checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id || item._id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-xl bg-slate-950 flex-shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                  <span className="text-[10px] text-indigo-400 font-mono block uppercase">
                    {item.category.replace('-', ' ')}
                  </span>
                  <span className="text-sm font-bold text-slate-200">${item.price.toFixed(2)} each</span>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => updateCartQuantity(item.id || item._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.id || item._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">Subtotal</span>
                  <span className="text-sm font-extrabold text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id || item._id)}
                  className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary & Promo */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Order Summary</h2>

            {/* Promo Code Form */}
            <form onSubmit={applyPromo} className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student Promo Code</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder='Try "ASSIGNMENT10"'
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Apply
                </button>
              </div>
              {discount > 0 && (
                <p className="text-[11px] text-emerald-400 font-medium">🎉 15% Student Discount applied!</p>
              )}
            </form>

            <div className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Student Discount (15%)</span>
                  <span>-${(cartTotal * discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax / Service Fee</span>
                <span className="text-emerald-400 font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-indigo-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Stripe Checkout</span>
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secured with Stripe Payment Integration</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
