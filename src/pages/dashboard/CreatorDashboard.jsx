import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PlusCircle, 
  FolderKanban, 
  Copy, 
  Bookmark, 
  Layers, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/Skeleton';

export const CreatorDashboard = ({ navigate, currentPath }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [myPrompts, setMyPrompts] = useState([]);

  // Sync activeTab with URL sub-route
  useEffect(() => {
    const path = (currentPath || window.location.pathname).toLowerCase();
    const parts = path.split('/dashboard/creator/');
    if (parts[1]) {
      const sub = parts[1].replace(/\/$/, '');
      if (sub === 'myprompt' || sub === 'my-prompts' || sub === 'prompts') setActiveTab('my-prompts');
      else if (sub === 'add' || sub === 'add-prompt' || sub === 'new') setActiveTab('add-prompt');
      else if (sub === 'analytics' || sub === 'overview') setActiveTab('analytics');
    }
  }, [currentPath]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    let sub = 'analytics';
    if (tabKey === 'my-prompts') sub = 'myprompt';
    else if (tabKey === 'add-prompt') sub = 'add-prompt';
    else sub = 'analytics';

    if (navigate) {
      navigate(`/dashboard/creator/${sub}`);
    }
  };

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Coding');
  const [aiTool, setAiTool] = useState('ChatGPT');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('Pro');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80');
  const [visibility, setVisibility] = useState('Public');
  const [submittingPrompt, setSubmittingPrompt] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCreatorPrompts();
    }
  }, [token]);

  const fetchCreatorPrompts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prompts/my/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyPrompts(data.data || []);
      }
    } catch (err) {
      console.error('Fetch creator prompts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCopies = myPrompts.reduce((acc, p) => acc + (p.copyCount || 0), 0);
  const totalBookmarks = myPrompts.reduce((acc, p) => acc + (p.bookmarkCount || 0), 0);

  // Mock growth data for Recharts visualization based on creator prompts
  const analyticsChartData = [
    { month: 'Jan', copies: Math.round(totalCopies * 0.1) || 12, bookmarks: Math.round(totalBookmarks * 0.1) || 4 },
    { month: 'Feb', copies: Math.round(totalCopies * 0.25) || 28, bookmarks: Math.round(totalBookmarks * 0.2) || 9 },
    { month: 'Mar', copies: Math.round(totalCopies * 0.45) || 64, bookmarks: Math.round(totalBookmarks * 0.4) || 22 },
    { month: 'Apr', copies: Math.round(totalCopies * 0.7) || 110, bookmarks: Math.round(totalBookmarks * 0.65) || 45 },
    { month: 'May', copies: totalCopies || 180, bookmarks: totalBookmarks || 72 }
  ];

  const handleAddPromptSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingPrompt(true);
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
        addToast('Prompt submitted for admin review!', 'success');
        setTitle('');
        setDescription('');
        setContent('');
        setTags('');
        fetchCreatorPrompts();
        setActiveTab('my-prompts');
      } else {
        addToast(data.message || 'Failed to submit prompt.', 'error');
      }
    } catch (err) {
      addToast('Error submitting prompt.', 'error');
    } finally {
      setSubmittingPrompt(false);
    }
  };

  const handleDeletePrompt = async (id) => {
    if (!window.confirm('Delete this prompt permanently?')) return;
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Prompt deleted.', 'info');
        setMyPrompts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      addToast('Failed to delete prompt.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 space-y-2 shrink-0">
        <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Creator Studio
        </div>

        <button
          onClick={() => handleTabChange('analytics')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics Home</span>
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-6xl">
        
        {/* TAB 1: CREATOR ANALYTICS HOME */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                  Creator Analytics & Insights
                </h2>
                <p className="text-xs text-slate-400">Track total prompt copies, growth engagement, and community bookmarks.</p>
              </div>
            </div>

            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Prompts</span>
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{myPrompts.length}</div>
                <div className="text-[11px] text-slate-400">Published Creator Library</div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-purple-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Copies</span>
                  <Copy className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{totalCopies}</div>
                <div className="text-[11px] text-slate-400">Community Deployments</div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Bookmarks</span>
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{totalBookmarks}</div>
                <div className="text-[11px] text-slate-400">User Bookmarks</div>
              </div>
            </div>

            {/* Recharts Analytics Chart */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Prompt Copies & Growth Chart
              </h3>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsChartData}>
                    <defs>
                      <linearGradient id="copiesColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="copies" stroke="#6366f1" fillOpacity={1} fill="url(#copiesColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD PROMPT */}
        {activeTab === 'add-prompt' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-indigo-400" />
              Creator Add Prompt
            </h2>

            <form onSubmit={handleAddPromptSubmit} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cyberpunk Photorealistic Midjourney V6 Master"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed summary of the intended AI model output..."
                  rows="2"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Prompt Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full text of prompt instructions..."
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
                    <option value="Public">Public (Free)</option>
                    <option value="Private">Private (Premium)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Midjourney, Render, Art"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPrompt}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all mt-2"
              >
                {submittingPrompt ? 'Submitting...' : 'Submit Prompt for Approval'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MY PROMPTS */}
        {activeTab === 'my-prompts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
              Manage Creator Prompts
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
                      <th className="p-4">Copy Count</th>
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
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(p._id)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950"
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
                No creator prompts submitted yet.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
