import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderCheck, 
  CreditCard, 
  ShieldAlert, 
  BarChart2, 
  Check, 
  X, 
  Trash2, 
  Star, 
  Eye, 
  Crown, 
  Sparkles,
  DollarSign,
  Copy,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/Skeleton';
import { apiFetch } from '../../utils/api';

export const AdminDashboard = ({ navigate, currentPath }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(false);

  // Sync activeTab with URL path
  useEffect(() => {
    const path = (currentPath || window.location.pathname).toLowerCase();
    const parts = path.split('/dashboard/admin/');
    if (parts[1]) {
      const sub = parts[1].replace(/\/$/, '');
      if (['analytics', 'users', 'prompts', 'reports', 'payments'].includes(sub)) {
        setActiveTab(sub);
      }
    }
  }, [currentPath]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (navigate) {
      navigate(`/dashboard/admin/${tabKey}`);
    }
  };

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [promptsList, setPromptsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);

  // Rejection Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingPromptId, setRejectingPromptId] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Always fetch analytics overview
      const analyticsRes = await apiFetch('/api/admin/analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) setAnalytics(analyticsData.data);

      if (activeTab === 'users') {
        const res = await apiFetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsersList(data.data || []);
      } else if (activeTab === 'prompts') {
        const res = await apiFetch('/api/admin/prompts');
        const data = await res.json();
        if (data.success) setPromptsList(data.data || []);
      } else if (activeTab === 'reports') {
        const res = await apiFetch('/api/admin/reports');
        const data = await res.json();
        if (data.success) setReportsList(data.data || []);
      } else if (activeTab === 'payments') {
        const res = await apiFetch('/api/admin/payments');
        const data = await res.json();
        if (data.success) setPaymentsList(data.data || []);
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        addToast('User role updated successfully.', 'success');
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      addToast('Failed to update user role.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        addToast('User deleted.', 'success');
        setUsersList(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      addToast('Failed to delete user.', 'error');
    }
  };

  // Prompt Moderation Actions
  const handleApprovePrompt = async (promptId) => {
    try {
      const res = await apiFetch(`/api/admin/prompts/${promptId}/approve`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        addToast('Prompt approved successfully!', 'success');
        setPromptsList(prev => prev.map(p => p._id === promptId ? { ...p, status: 'approved' } : p));
      }
    } catch (err) {
      addToast('Approval failed.', 'error');
    }
  };

  const handleOpenRejectModal = (promptId) => {
    setRejectingPromptId(promptId);
    setRejectionFeedback('Does not meet quality standards.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    try {
      const res = await apiFetch(`/api/admin/prompts/${rejectingPromptId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejectionReason: rejectionFeedback })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Prompt rejected with feedback.', 'info');
        setPromptsList(prev => prev.map(p => p._id === rejectingPromptId ? { ...p, status: 'rejected', rejectionReason: rejectionFeedback } : p));
        setRejectModalOpen(false);
      }
    } catch (err) {
      addToast('Rejection failed.', 'error');
    }
  };

  const handleToggleFeatured = async (promptId) => {
    try {
      const res = await apiFetch(`/api/admin/prompts/${promptId}/feature`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'success');
        setPromptsList(prev => prev.map(p => p._id === promptId ? { ...p, isFeatured: data.isFeatured } : p));
      }
    } catch (err) {
      addToast('Failed to toggle feature status.', 'error');
    }
  };

  const handleDeletePrompt = async (promptId) => {
    if (!window.confirm('Delete this prompt permanently?')) return;
    try {
      const res = await apiFetch(`/api/prompts/${promptId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        addToast('Prompt deleted.', 'info');
        setPromptsList(prev => prev.filter(p => p._id !== promptId));
      }
    } catch (err) {
      addToast('Delete failed.', 'error');
    }
  };

  // Report Resolution
  const handleResolveReport = async (reportId) => {
    try {
      const res = await apiFetch(`/api/admin/reports/${reportId}/dismiss`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        addToast('Report resolved & dismissed.', 'success');
        setReportsList(prev => prev.filter(r => r._id !== reportId));
      }
    } catch (err) {
      addToast('Failed to dismiss report.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row w-full overflow-x-hidden">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 bg-slate-900/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 lg:p-6 space-y-2 shrink-0 md:min-h-[calc(100vh-4rem)]">
        <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Portal</span>
        </div>

        <button
          onClick={() => handleTabChange('analytics')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Users</span>
        </button>

        <button
          onClick={() => handleTabChange('prompts')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'prompts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FolderCheck className="w-4 h-4" />
          <span>Moderate Prompts</span>
        </button>

        <button
          onClick={() => handleTabChange('reports')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Reported Content</span>
        </button>

        <button
          onClick={() => handleTabChange('payments')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2.5 transition-colors ${
            activeTab === 'payments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Revenue</span>
        </button>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto overflow-x-auto">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-6 h-6 text-indigo-400" />
                PromptHub AI Platform Metrics
              </h2>
              <p className="text-xs text-slate-400">Live operational stats, total user accounts, and moderation stats.</p>
            </div>

            {loading || !analytics ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-indigo-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{analytics.totalUsers}</div>
                  <div className="text-[11px] text-slate-400">Registered Accounts</div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-purple-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Prompts</span>
                    <FolderCheck className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{analytics.totalPrompts}</div>
                  <div className="text-[11px] text-emerald-400">{analytics.approvedPrompts} Approved & Live</div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">${analytics.totalRevenue}</div>
                  <div className="text-[11px] text-slate-400">{analytics.totalPayments} Premium Upgrades ($5)</div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Copies</span>
                    <Copy className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{analytics.totalCopies}</div>
                  <div className="text-[11px] text-slate-400">Platform Clipboard Copies</div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-rose-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Reported Prompts</span>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{analytics.totalReports}</div>
                  <div className="text-[11px] text-slate-400">Active User Flags</div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Reviews</span>
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{analytics.totalReviews}</div>
                  <div className="text-[11px] text-slate-400">Community Feedback Ratings</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE USERS */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" />
              Manage All Platform Users
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Subscription</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img 
                            src={u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                            alt={u.name} 
                            className="w-8 h-8 rounded-full object-cover bg-slate-800"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'; }} 
                          />
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="user">User</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.subscription === 'premium' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.subscription}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MODERATE PROMPTS */}
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderCheck className="w-6 h-6 text-indigo-400" />
              Prompt Moderation Queue
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Creator</th>
                      <th className="p-4">AI Tool</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {promptsList.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-semibold text-white max-w-xs truncate">{p.title}</td>
                        <td className="p-4 text-slate-300">{p.creatorName}</td>
                        <td className="p-4">{p.aiTool}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            p.status === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleFeatured(p._id)}
                            className={`p-1 rounded-lg border transition-colors ${
                              p.isFeatured ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                            title="Toggle Featured"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/prompts/${p._id}`)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {p.status !== 'approved' && (
                            <button
                              onClick={() => handleApprovePrompt(p._id)}
                              className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                              title="Approve Prompt"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {p.status !== 'rejected' && (
                            <button
                              onClick={() => handleOpenRejectModal(p._id)}
                              className="p-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900"
                              title="Reject Prompt"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
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
            )}
          </div>
        )}

        {/* TAB 4: REPORTED PROMPTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              Reported Prompts Flags
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : reportsList.length > 0 ? (
              <div className="space-y-4">
                {reportsList.map((r) => (
                  <div key={r._id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-bold uppercase">
                        Reason: {r.reason}
                      </span>
                      <h4 className="text-sm font-bold text-white">Prompt ID: {r.promptId?._id || r.promptId}</h4>
                      <p className="text-xs text-slate-400">Reporter: {r.reporterEmail} | Details: {r.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/prompts/${r.promptId?._id || r.promptId}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleResolveReport(r._id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
                No active prompt reports in queue.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: PAYMENT REVENUE */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-400" />
              Payment & Subscription Transactions
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">User Email</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paymentsList.map((pay) => (
                      <tr key={pay._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-amber-300">{pay.transactionId}</td>
                        <td className="p-4 font-semibold text-white">{pay.userEmail}</td>
                        <td className="p-4">{pay.plan}</td>
                        <td className="p-4 font-bold text-emerald-400">${pay.amount}.00</td>
                        <td className="p-4 text-slate-400">{new Date(pay.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* REJECTION MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Provide Rejection Feedback
            </h3>

            <p className="text-xs text-slate-400">
              Explain why this prompt was rejected so the creator can revise and resubmit.
            </p>

            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              rows="3"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
