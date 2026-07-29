import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Users, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Compass, 
  Cpu, 
  Flame,
  Terminal,
  Layers,
  HelpCircle
} from 'lucide-react';
import { PromptCard } from '../components/prompts/PromptCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { apiFetch } from '../utils/api';

export const Home = ({ navigate }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  const trendingTags = ['#ChatGPT-4o', '#Midjourney-v6', '#Claude3.5', '#NextJS-Architect', '#SEO-Strategy', '#CyberpunkArt'];

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (token) {
      fetchBookmarks();
    }
  }, [token]);

  const fetchHomeData = async () => {
    try {
      setLoadingPrompts(true);
      const [promptsRes, creatorsRes, reviewsRes] = await Promise.all([
        apiFetch('/api/prompts/featured'),
        apiFetch('/api/prompts/creators/top'),
        apiFetch('/api/prompts/reviews/recent')
      ]);

      const promptsData = await promptsRes.json();
      const creatorsData = await creatorsRes.json();
      const reviewsData = await reviewsRes.json();

      if (promptsData.success) setFeaturedPrompts(promptsData.data || []);
      if (creatorsData.success) setTopCreators(creatorsData.data || []);
      if (reviewsData.success) setReviews(reviewsData.data || []);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoadingPrompts(false);
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
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/prompts?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/prompts');
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

  const handleCardNavigate = (route) => {
    if (!user) {
      addToast('Please login to view full prompt details.', 'info');
      navigate('/login');
    } else {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-6 shadow-lg shadow-indigo-950/50"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>The #1 Marketplace for AI Prompt Engineers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Supercharge Your Workflow With <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Battle-Tested AI Prompts
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Discover, bookmark, and deploy verified prompt blueprints for ChatGPT, Gemini, Claude, and Midjourney. Created by top prompt artisans worldwide.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md mb-6"
          >
            <div className="flex items-center gap-2 pl-3 flex-1 text-slate-400">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts by keyword, tool (ChatGPT, Claude), or category..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              Search
            </button>
          </motion.form>

          {/* Trending Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 text-xs"
          >
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending:
            </span>
            {trendingTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/prompts?search=${encodeURIComponent(tag.replace('#', ''))}`)}
                className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED PROMPTS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Featured & Trending Prompts
            </h2>
          </div>

          <button
            onClick={() => navigate('/prompts')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Explore All Marketplace Prompts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loadingPrompts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPrompts.map((p) => (
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
        ) : (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No featured prompts available yet.</p>
          </div>
        )}
      </section>

      {/* 3. WHY CHOOSE US SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Why Prompt Engineers Choose PromptHub AI
            </h2>
            <p className="text-slate-400 text-sm">
              Designed specifically for creators, developers, and businesses seeking reliable AI outputs without endless trial and error.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Verified Quality Standards</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All submitted prompts undergo thorough admin review before listing to ensure syntax validity and exceptional AI response accuracy.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">One-Click Copy & Deploy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Seamlessly copy prompts directly into your clipboard with automated variable placeholders ready for ChatGPT or Claude execution.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monetize Your Mastery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Creators can mark specialized prompts as Premium and gain recognition across our growing prompt engineering community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. TOP CREATORS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Leaderboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Top Prompt Creators
          </h2>
          <p className="text-slate-400 text-sm">
            Meet the most influential prompt engineering specialists driving innovation on PromptHub.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCreators.map((creator, idx) => (
            <motion.div
              key={creator._id || idx}
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4 shadow-lg"
            >
              <div className="relative">
                <img
                  src={creator.creatorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={creator.creatorName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40"
                />
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  #{idx + 1}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white line-clamp-1">{creator.creatorName}</h4>
                <p className="text-xs text-slate-400 truncate mb-1">{creator.creatorEmail}</p>
                <div className="flex items-center gap-3 text-xs text-indigo-300 font-medium">
                  <span>{creator.totalPrompts} Prompts</span>
                  <span>•</span>
                  <span>{creator.totalCopies} Copies</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. CUSTOMER REVIEWS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Community Reviews & Feedback
            </h2>
            <p className="text-slate-400 text-sm">
              See what developers, marketers, and researchers say about our prompt library.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60">
                  <img
                    src={rev.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={rev.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.userName}</h5>
                    <p className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EXTRA SECTION 1: AI TOOL CATEGORIES EXPLORER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Explore Prompts by AI Model
          </h2>
          <p className="text-slate-400 text-sm">
            Tailored prompts engineered explicitly for each LLM and generative AI engine.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'ChatGPT', icon: '🤖', desc: 'GPT-4o & GPT-o1 prompts', color: 'border-emerald-800/60 bg-emerald-950/20' },
            { name: 'Gemini', icon: '✨', desc: 'Google Gemini 1.5 Pro', color: 'border-blue-800/60 bg-blue-950/20' },
            { name: 'Claude', icon: '💡', desc: 'Anthropic Claude 3.5 Sonnet', color: 'border-amber-800/60 bg-amber-950/20' },
            { name: 'Midjourney', icon: '🎨', desc: 'v6 Photorealism & Art', color: 'border-purple-800/60 bg-purple-950/20' }
          ].map((tool) => (
            <motion.button
              key={tool.name}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/prompts?aiTool=${tool.name}`)}
              className={`p-5 rounded-2xl border ${tool.color} text-left flex flex-col justify-between transition-all shadow-lg`}
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">{tool.name}</h4>
                <p className="text-xs text-slate-400">{tool.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 7. EXTRA SECTION 2: PLATFORM STATS & PROMPT ENGINEERING CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 inline-block">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Upgrade Your AI Capabilities?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed mb-6">
              Unlock our entire library of private premium prompts for a one-time $5 lifetime subscription. No monthly recurring fees.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/payment')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all"
              >
                Unlock Lifetime Access ($5)
              </button>
              <button
                onClick={() => navigate('/prompts')}
                className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white font-semibold text-sm transition-all"
              >
                Browse Free Marketplace
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mb-1">10,000+</div>
              <div className="text-xs text-slate-400">Prompts Deployed</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mb-1">50,000+</div>
              <div className="text-xs text-slate-400">Total Prompt Copies</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mb-1">99.8%</div>
              <div className="text-xs text-slate-400">Satisfaction Score</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">24/7</div>
              <div className="text-xs text-slate-400">Community Moderation</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
