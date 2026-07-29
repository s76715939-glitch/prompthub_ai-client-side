'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { INITIAL_PRODUCTS } from '@/lib/initial-data';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  CreditCard,
  Code2,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ProductDetailPage({ params }) {
  // Unwrap params safely for Next.js App Router
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const router = RouterHook();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  function RouterHook() {
    try {
      return useRouter();
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    async function getProduct() {
      try {
        const res = await fetch(`/api/products`);
        if (res.ok) {
          const data = await res.json();
          const found = data.products.find(p => p.id === productId || p._id === productId || p.slug === productId);
          if (found) {
            setProduct(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {}

      // Fallback
      const fallback = INITIAL_PRODUCTS.find(p => p.id === productId || p._id === productId || p.slug === productId);
      setProduct(fallback || INITIAL_PRODUCTS[0]);
      setLoading(false);
    }

    getProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link href="/products" className="text-indigo-400 hover:underline text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id || item._id === product._id);

  const handleInstantBuy = () => {
    addToCart(product, quantity);
    if (router) router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Catalog</span>
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Left: Product Image & Badges */}
        <div className="space-y-4">
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-96 object-cover"
            />
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 rounded-xl bg-slate-900/90 backdrop-blur text-slate-300 hover:text-pink-400 border border-slate-800 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
            <div className="absolute top-4 left-4 bg-indigo-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-md shadow-lg">
              {product.category.replace('-', ' ')}
            </div>
          </div>

          {/* Code Architecture Specs */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Project Package Specifications</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Framework</span>
                <span className="text-white font-semibold">Next.js App Router</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Styling</span>
                <span className="text-cyan-400 font-semibold">Tailwind CSS v4</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Backend Engine</span>
                <span className="text-emerald-400 font-semibold">Node.js Express / API</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Database</span>
                <span className="text-amber-400 font-semibold">MongoDB & Mongoose</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details & Purchase Options */}
        <div className="space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-300 text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-400">({product.reviewsCount} customer reviews)</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-auto">
                Instant Download
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white leading-tight">
              {product.title}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">Special Assignment Price</span>
              <span className="text-3xl font-black text-white">${product.price.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">In Stock</span>
              <span className="text-xs text-slate-400">Digital Deliverable (.ZIP)</span>
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-300">Quantity:</span>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Add To Cart</span>
              </button>

              <button
                onClick={handleInstantBuy}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy with Stripe</span>
              </button>
            </div>

          </div>

          {/* Features Checklist */}
          <div className="border-t border-slate-800 pt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400">What's included in this project:</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full Source Code in <strong>pure JavaScript (.js / .jsx)</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Next.js App Router Page layouts & API Route Handlers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MongoDB Mongoose Schema definitions for Products & Orders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Stripe Checkout payment integration API and test simulator</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
