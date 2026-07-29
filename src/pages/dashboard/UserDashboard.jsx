import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  FolderKanban, 
  Bookmark, 
  MessageSquare, 
  User as UserIcon, 
  Trash2, 
  Edit3, 
  Eye, 
  Crown, 
  ExternalLink,
  Layers,
  Sparkles,
  BarChart2,
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/Skeleton';
import { apiFetch } from '../../utils/api';

export const UserDashboard = ({ navigate, currentPath, defaultTab = 'profile' }) => {
  const { user, token, setUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  // Sync activeTab with URL sub-route
  useEffect(() => {
    const path = (currentPath || window.location.pathname).toLowerCase();
    const parts = path.split('/dashboard/user/');
    if (parts[1]) {
      const sub = parts[1].replace(/\/$/, '');
      if (sub === 'myprompt' || sub === 'my-prompts' || sub === 'my-prompt') setActiveTab('my-prompts');
      else if (sub === 'saved' || sub === 'saved-prompts' || sub === 'bookmarks') setActiveTab('saved-prompts');
      else if (sub === 'reviews' || sub === 'my-reviews') setActiveTab('my-reviews');
      else if (sub === 'add' || sub === 'add-prompt' || sub === 'new') setActiveTab('add-prompt');
      else if (sub === 'profile') setActiveTab('profile');
    }
  }, [currentPath]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    let sub = 'profile';
    if (tabKey === 'my-prompts') sub = 'myprompt';
    else if (tabKey === 'saved-prompts') sub = 'saved';
    else if (tabKey === 'my-reviews') sub = 'reviews';
    else if (tabKey === 'add-prompt') sub = 'add-prompt';
    else if (tabKey === 'profile') sub = 'profile';

    if (navigate) {
      navigate(`/dashboard/user/${sub}`);
    }
  };

  // Data states
  const [myPrompts, setMyPrompts] = useState([]);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  // Add Prompt Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Coding');
  const [aiTool, setAiTool] = useState('ChatGPT');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80');
  const [visibility, setVisibility] = useState('Public');
  const [submittingPrompt, setSubmittingPrompt] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token, activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my-prompts') {
        const res = await apiFetch('/api/prompts/my/user');
        const data = await res.json();
        if (data.success) setMyPrompts(data.data || []);
      } else if (activeTab === 'saved-prompts') {
        const res = await apiFetch('/api/prompts/my/bookmarks');
        const data = await res.json();
        if (data.success) setSavedPrompts(data.data || []);
      } else if (activeTab === 'my-reviews') {
        const res = await apiFetch('/api/prompts/my/reviews');
        const data = await res.json();
        if (data.success) setMyReviews(data.data || []);
      } else if (activeTab === 'profile') {
        const res = await apiFetch('/api/prompts/my/user');
        const data = await res.json();
        if (data.success) setMyPrompts(data.data || []);
      }
    } catch (err) {
      console.error('Fetch user dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromptSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !content) {
      addToast('Please fill in prompt title, description, and content.', 'error');
      return;
    }

    try {
      setSubmittingPrompt(true);
      const res = await apiFetch('/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          content,
          category,
          aiTool,
          tags,
          difficulty,
          thumbnail,
          visibility
        })
      });

      const data = await res.json();

      if (data.success) {
        addToast(data.message || 'Prompt submitted for admin approval!', 'success');
        setTitle('');
        setDescription('');
        setContent('');
        setTags('');
        setActiveTab('my-prompts');
      } else if (data.isLimitReached) {
        addToast(data.message, 'error');
      } else {
        addToast(data.message || 'Failed to add prompt.', 'error');
      }
    } catch (err) {
      addToast('Network error while adding prompt.', 'error');
    } finally {
      setSubmittingPrompt(false);
    }
  };

  const handleDeletePrompt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;

    try {
      const res = await apiFetch(`/api/prompts/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        addToast('Prompt deleted successfully.', 'success');
        setMyPrompts(prev => prev.filter(p => p._id !== id));
      } else {
        addToast(data.message || 'Delete failed.', 'error');
      }
    } catch (err) {
      addToast('Network error deleting prompt.', 'error');
    }
  };

  const handleRemoveBookmark = async (promptId) => {
    try {
      const res = await apiFetch(`/api/prompts/${promptId}/bookmark`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        addToast('Bookmark removed.', 'info');
        setSavedPrompts(prev => prev.filter(p => p._id !== promptId));
      }
    } catch (err) {
      addToast('Failed to remove bookmark.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 lg:p-6 space-y-2 shrink-0 md:min-h-[calc(100vh-4rem)]">
        <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          User Dashboard
        </div>

        <button
          onClick={() => handleTabChange('profile')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => handleTabChange('add-prompt')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'add-prompt' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Prompt</span>
        </button>

        <button
          onClick={() => handleTabChange('my-prompts')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'my-prompts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>My Prompts</span>
        </button>

        <button
          onClick={() => handleTabChange('saved-prompts')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'saved-prompts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Prompts</span>
        </button>

        <button
          onClick={() => handleTabChange('my-reviews')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'my-reviews' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Reviews</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto overflow-x-auto">
        
        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && user && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-indigo-400" />
              Account Profile
            </h2>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-5">
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30"
                />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {user.name}
                    {(user.subscription === 'premium' || user.role === 'admin') && (
                      <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] uppercase font-bold">
                      Role: {user.role}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                      (user.subscription === 'premium' || user.role === 'admin')
                        ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      Status: {user.role === 'admin' ? 'premium' : user.subscription}
                    </span>
                  </div>
                </div>
              </div>

              {user.subscription === 'free' && user.role !== 'admin' && (
                <button
                  onClick={() => navigate('/payment')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>Upgrade to Premium ($5)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-2xl font-extrabold text-indigo-400">{myPrompts.length}</div>
                <div className="text-xs text-slate-400">Total Submitted Prompts</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-2xl font-extrabold text-purple-400">
                  {user.subscription === 'free' ? `${myPrompts.length} / 3` : 'Unlimited'}
                </div>
                <div className="text-xs text-slate-400">Free Submission Limit</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD PROMPT */}
        {activeTab === 'add-prompt' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-indigo-400" />
              Create & Submit Prompt
            </h2>

            {user?.subscription === 'free' && myPrompts.length >= 3 && (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center justify-between gap-4">
                <span>Free accounts are limited to 3 prompt submissions. Upgrade to Premium for unlimited creations.</span>
                <button
                  onClick={() => navigate('/payment')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shrink-0"
                >
                  Upgrade ($5)
                </button>
              </div>
            )}

            <form onSubmit={handleAddPromptSubmit} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Full-Stack Next.js 15 Application Architect"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of what this prompt accomplishes..."
                  rows="2"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Blueprint Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your exact AI prompt instructions here..."
                  rows="5"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Writing">Writing</option>
                    <option value="Art & Design">Art & Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Business">Business</option>
                    <option value="SEO">SEO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">AI Tool</label>
                  <select
                    value={aiTool}
                    onChange={(e) => setAiTool(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ChatGPT">ChatGPT</option>
                    <option value="Gemini">Gemini</option>
                    <option value="Claude">Claude</option>
                    <option value="Midjourney">Midjourney</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Public">Public (Free for All)</option>
                    <option value="Private">Private (Premium Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Nextjs, React, TailWind"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPrompt}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all mt-2"
              >
                {submittingPrompt ? 'Submitting Prompt...' : 'Submit Prompt for Review'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MY PROMPTS */}
        {activeTab === 'my-prompts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
              My Submitted Prompts ({myPrompts.length})
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : myPrompts.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">AI Tool</th>
                      <th className="p-4">Visibility</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Copies</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myPrompts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-semibold text-white max-w-xs truncate">{p.title}</td>
                        <td className="p-4">{p.aiTool}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.visibility === 'Private' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {p.visibility}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            p.status === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4">{p.copyCount || 0}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/prompts/${p._id}`)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(p._id)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
                You haven't submitted any prompts yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 4: SAVED PROMPTS */}
        {activeTab === 'saved-prompts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-indigo-400" />
              Saved / Bookmarked Prompts
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : savedPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPrompts.map((p) => (
                  <div key={p._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 shadow-lg">
                    <div className="space-y-1 truncate">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">{p.aiTool} • {p.category}</span>
                      <h4 className="text-sm font-bold text-white truncate">{p.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{p.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/prompts/${p._id}`)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark(p._id)}
                        className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
                No saved prompts yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: MY REVIEWS */}
        {activeTab === 'my-reviews' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
              My Submitted Reviews
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : myReviews.length > 0 ? (
              <div className="space-y-3">
                {myReviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">
                        Prompt ID: {rev.promptId?._id || rev.promptId}
                      </span>
                      <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-200">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
                You haven't posted any reviews yet.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
