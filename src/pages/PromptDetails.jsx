import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Bookmark, 
  Lock, 
  Star, 
  Flag, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Cpu, 
  Layers, 
  BarChart2, 
  User, 
  Clock, 
  Send, 
  X, 
  ShieldAlert,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/Skeleton';
import { apiFetch } from '../utils/api';

export const PromptDetails = ({ promptId, navigate }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    fetchPromptDetails();
    if (token) {
      checkBookmarkStatus();
    }
  }, [promptId, token]);

  const fetchPromptDetails = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/prompts/${promptId}`);
      const data = await res.json();

      if (data.success) {
        setPrompt(data.data);
      } else {
        addToast(data.message || 'Prompt not found', 'error');
        navigate('/prompts');
      }
    } catch (err) {
      addToast('Failed to load prompt details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await apiFetch('/api/prompts/my/bookmarks');
      const data = await res.json();
      if (data.success && data.data) {
        const bookmarked = data.data.some(p => p._id === promptId);
        setIsBookmarked(bookmarked);
      }
    } catch (err) {
      console.error('Check bookmark error:', err);
    }
  };

  const isPrivate = prompt?.visibility === 'Private';
  const hasPremiumAccess = user && (user.subscription === 'premium' || user.role === 'admin' || user.role === 'creator' || user._id === prompt?.creatorId);
  const isLocked = isPrivate && !hasPremiumAccess;

  const handleCopyPrompt = async () => {
    if (isLocked) {
      addToast('Upgrade to Premium to copy this prompt.', 'info');
      navigate('/payment');
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      // Increment copy count in database
      await apiFetch(`/api/prompts/${promptId}/copy`, { method: 'POST' });
      setPrompt(prev => prev ? { ...prev, copyCount: (prev.copyCount || 0) + 1 } : null);

      addToast('Prompt copied to clipboard!', 'success');
    } catch (err) {
      addToast('Failed to copy to clipboard.', 'error');
    }
  };

  const handleBookmarkToggle = async () => {
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
        setIsBookmarked(data.isBookmarked);
        addToast(data.message, 'success');
      } else {
        addToast(data.message || 'Bookmark failed.', 'error');
      }
    } catch (err) {
      addToast('Network error during bookmarking.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addToast('Please login to leave a review.', 'info');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      addToast('Please write a review comment.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await apiFetch(`/api/prompts/${promptId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();

      if (data.success) {
        addToast('Review submitted successfully!', 'success');
        setComment('');
        fetchPromptDetails();
      } else {
        addToast(data.message || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      addToast('Network error submitting review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addToast('Please login to report prompts.', 'info');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReport(true);
      const res = await apiFetch(`/api/prompts/${promptId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason: reportReason, description: reportDescription })
      });
      const data = await res.json();

      if (data.success) {
        addToast(data.message, 'success');
        setReportModalOpen(false);
        setReportDescription('');
      } else {
        addToast(data.message || 'Report submission failed.', 'error');
      }
    } catch (err) {
      addToast('Network error submitting report.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!prompt) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back Navigation Button */}
        <button
          onClick={() => navigate('/prompts')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        {/* Main Details Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header Info */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  {prompt.aiTool}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {prompt.category}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                  {prompt.difficulty}
                </span>
                {isPrivate && (
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Premium Prompt
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {prompt.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {prompt.description}
              </p>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleBookmarkToggle}
                className={`px-4 py-2.5 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all ${
                  isBookmarked
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-slate-950' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-colors"
                title="Report Prompt"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prompt Content Section (Public vs Premium Lock) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Prompt Blueprint Content
              </h3>

              {!isLocked && (
                <button
                  onClick={handleCopyPrompt}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              )}
            </div>

            {isLocked ? (
              <div className="relative rounded-2xl overflow-hidden border border-amber-900/50 bg-slate-950 p-8 text-center space-y-4">
                <div className="blur-sm select-none text-slate-600 text-sm font-mono leading-relaxed max-h-32 overflow-hidden pointer-events-none">
                  /imagine prompt: Ultra high resolution photorealistic architecture concept, volumetric lighting, octanestyles, cinematic rendering...
                </div>

                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 shadow-xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">This is a Premium Locked Prompt</h4>
                  <p className="text-xs text-slate-400 max-w-md">
                    Subscribe to PromptHub AI Premium for a one-time $5 lifetime payment to unlock full prompt access, copying, and review features.
                  </p>
                  <button
                    onClick={() => navigate('/payment')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/25 transition-all"
                  >
                    Subscribe to Premium ($5)
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                {prompt.content}
              </div>
            )}
          </div>

          {/* Usage Instructions & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recommended Usage Instructions
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                Paste directly into <strong className="text-indigo-400">{prompt.aiTool}</strong>. Replace any bracketed variables like <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">[FEATURE_NAME]</code> or <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">[TOPIC]</code> with your specific requirements.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Prompt Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {prompt.tags && prompt.tags.length > 0 ? (
                  prompt.tags.map((tag, i) => (
                    <span
                      key={i}
                      onClick={() => navigate(`/prompts?search=${encodeURIComponent(tag)}`)}
                      className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 hover:text-indigo-400 hover:border-indigo-800 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No tags provided.</span>
                )}
              </div>
            </div>
          </div>

          {/* Creator Information Footer */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={prompt.creatorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={prompt.creatorName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
              />
              <div>
                <h5 className="text-sm font-bold text-white">{prompt.creatorName}</h5>
                <p className="text-xs text-slate-400">{prompt.creatorEmail}</p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>Total Copies: <strong className="text-indigo-400">{prompt.copyCount || 0}</strong></div>
              <div>Added: {new Date(prompt.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

        </div>

        {/* Reviews & Ratings Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Community Reviews & Ratings ({prompt.reviewCount || 0})
              </h3>
              <p className="text-xs text-slate-400">Average Rating: <strong className="text-amber-400">{prompt.avgRating || '5.0'} / 5.0</strong></p>
            </div>
          </div>

          {/* Write Review Form */}
          {isLocked ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 text-xs text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Reviews are locked for private prompts until you upgrade to Premium.</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Leave a Review</h4>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share how this prompt helped your AI workflow..."
                rows="3"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          )}

          {/* List of Reviews */}
          <div className="space-y-4">
            {prompt.reviews && prompt.reviews.length > 0 ? (
              prompt.reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={rev.userName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{rev.userName}</span>
                        <span className="text-[10px] text-slate-500">{rev.userEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-9">
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">No reviews yet. Be the first to review this prompt!</p>
            )}
          </div>
        </div>

      </div>

      {/* REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Report Inappropriate Prompt
              </h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Violation Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Spam">Spam or Misleading Title</option>
                  <option value="Copyright Violation">Copyright Violation</option>
                  <option value="Harmful or Unsafe">Harmful or Malicious Script</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Additional Description (Optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide context for our moderation team..."
                  rows="3"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
