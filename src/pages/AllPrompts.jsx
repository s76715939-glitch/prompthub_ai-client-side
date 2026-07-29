import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  Layers,
  Cpu,
  BarChart2
} from 'lucide-react';
import { PromptCard } from '../components/prompts/PromptCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { apiFetch } from '../utils/api';

export const AllPrompts = ({ navigate, initialSearch = '' }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // Search, Filter & Pagination states
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [aiTool, setAiTool] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrompts, setTotalPrompts] = useState(0);

  const categories = ['All', 'Coding', 'Writing', 'Art & Design', 'Marketing', 'Productivity', 'Business', 'SEO'];
  const aiTools = ['All', 'ChatGPT', 'Gemini', 'Claude', 'Midjourney'];
  const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Pro'];

  useEffect(() => {
    fetchPrompts();
  }, [search, category, aiTool, difficulty, sortBy, page]);

  useEffect(() => {
    if (token) {
      fetchBookmarks();
    }
  }, [token]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search,
        category,
        aiTool,
        difficulty,
        sortBy,
        page: page.toString(),
        limit: '6' // 6 items per page to showcase pagination cleanly across pages
      });

      const res = await apiFetch(`/api/prompts?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPrompts(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalPrompts(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Fetch prompts error:', err);
      addToast('Failed to load prompts from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await apiFetch('/api/prompts/my/bookmarks');
      const data = await res.json();
      if (data.success && data.data) {
        setBookmarkedIds(new Set(data.data.map(p => p._id)));
      }
    } catch (err) {
      console.error('Fetch bookmarks error:', err);
    }
  };

  const handleBookmarkToggle = async (promptId) => {
    if (!token) {
      addToast('Please login to bookmark prompts.', 'info');
      navigate('/login');
      return;
    }

    try {
      const res = await apiFetch(`/api/prompts/${promptId}/bookmark`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (data.isBookmarked) {
            next.add(promptId);
          } else {
            next.delete(promptId);
          }
          return next;
        });
        addToast(data.message, 'success');
      } else {
        addToast(data.message || 'Bookmark failed.', 'error');
      }
    } catch (err) {
      addToast('Network error while bookmarking.', 'error');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setAiTool('All');
    setDifficulty('All');
    setSortBy('latest');
    setPage(1);
  };

  const handleCardNavigate = (route) => {
    if (!user) {
      addToast('Please login to view prompt details.', 'info');
      navigate('/login');
    } else {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            AI Prompt Marketplace
          </h1>
          <p className="text-slate-400 text-sm">
            Discover {totalPrompts} battle-tested AI prompts for ChatGPT, Gemini, Claude, and Midjourney. Filtered server-side for real-time performance.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl mb-8 space-y-4">
          
          {/* Top row: Search input & Sort dropdown */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            <div className="relative w-full md:w-1/2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by Title, Tag, or AI Tool..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 whitespace-nowrap">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Sort By:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-48 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="latest">Latest Additions</option>
                <option value="most_copied">Most Copied</option>
                <option value="popular">Most Popular / Bookmarked</option>
              </select>

              <button
                onClick={resetFilters}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors shrink-0"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom row: Filter selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
            
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* AI Tool Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" /> AI Tool
              </label>
              <select
                value={aiTool}
                onChange={(e) => {
                  setAiTool(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {aiTools.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-amber-400" /> Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {difficultyLevels.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Prompt Grid / Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : prompts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {prompts.map((p) => (
                <PromptCard
                  key={p._id}
                  prompt={p}
                  isBookmarked={bookmarkedIds.has(p._id)}
                  onBookmark={handleBookmarkToggle}
                  onNavigate={handleCardNavigate}
                  user={user}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-xs text-slate-400">
                  Showing page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span> ({totalPrompts} total prompts)
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Prompts Found</h3>
            <p className="text-xs text-slate-400 mb-4">Try adjusting your search queries or clearing active filters.</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
