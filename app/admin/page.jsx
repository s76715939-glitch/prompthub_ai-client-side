'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { 
  Database, 
  PlusCircle, 
  Package, 
  CheckCircle2, 
  CreditCard, 
  Sparkles, 
  Layers,
  RefreshCw,
  Tag
} from 'lucide-react';

export default function AdminPage() {
  const { mongoStatus, checkMongoStatus, showToast } = useCart();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('29.99');
  const [category, setCategory] = useState('web-templates');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80');
  const [tags, setTags] = useState('Next.js, Tailwind, MongoDB');
  
  const [creating, setCreating] = useState(false);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          category,
          image,
          tags: tags.split(',').map((t) => t.trim()),
          downloadUrl: '/downloads/custom-project.zip',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Product "${title}" created successfully in ${data.source}!`);
        setTitle('');
        setDescription('');
      } else {
        alert(data.error || 'Failed to create product');
      }
    } catch (err) {
      alert('Error creating product: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB Mongoose Database Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create new assignment projects, inspect MongoDB connection status, and test APIs.
          </p>
        </div>

        <button
          onClick={checkMongoStatus}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-200 font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Re-check Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add New Product Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCreateProduct} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>Add Product / Project (POST /api/products)</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Pure JS Mongoose Handler</span>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next.js App Router E-Commerce Template"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="full-stack-kits">Full-Stack Kits</option>
                    <option value="web-templates">Web Templates</option>
                    <option value="ui-components">UI Components</option>
                    <option value="assignment-projects">Assignment Projects</option>
                    <option value="services">Services</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed assignment project description..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Image URL</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Next.js, Tailwind, Stripe, MongoDB"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {creating ? 'Saving to Database...' : 'Create & Save Product'}
            </button>
          </form>
        </div>

        {/* Right: MongoDB Connection Status Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>MongoDB Server Status</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connection:</span>
                <span className={`font-bold ${mongoStatus.connected ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {mongoStatus.connected ? 'ACTIVE' : 'FALLBACK READY'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Driver:</span>
                <span className="font-mono text-white">Mongoose Schema</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Models:</span>
                <span className="font-mono text-indigo-400">Product.js, Order.js</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If you have a MongoDB Atlas connection URI string, add it to <code className="text-indigo-300 font-mono bg-slate-950 px-1 py-0.5 rounded">.env.example</code> as <code className="text-indigo-300 font-mono bg-slate-950 px-1 py-0.5 rounded">MONGODB_URI</code>. The app automatically connects via Mongoose!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
