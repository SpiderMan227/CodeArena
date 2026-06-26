import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemList from './pages/ProblemList';
import AdminDashboard from './pages/AdminDashboard';
import ProblemDetail from './pages/ProblemDetail';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import { Terminal, LogOut, User as UserIcon, Lock, User, CheckCircle2, AlertTriangle } from 'lucide-react';

// Route guards
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

// Layout wrapper
function Layout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Failed to log out cleanly', err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-[#1f1f2e] bg-[#121216]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl hover:opacity-90 transition-opacity">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Terminal className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              CodeArena
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/problems"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors mr-2 hover:bg-[#1f1f2e]/50 px-3 py-1.5 rounded-xl border border-transparent"
                >
                  Problems
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors mr-2 hover:bg-[#1f1f2e]/50 px-3 py-1.5 rounded-xl border border-transparent"
                >
                  Leaderboard
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 bg-indigo-500/5 px-3 py-1.5 rounded-xl"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1f1f2e]/50 hover:bg-[#1f1f2e] text-sm text-slate-300 border border-[#2a2a3d] transition-all"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-sm text-rose-400 border border-rose-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

function UserProfile() {
  const { user, accessToken, setAuth } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setError('Previous password is required to save changes.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await api.put(
        '/auth/profile',
        { username, newPassword, oldPassword },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update state in store
      setAuth(response.data.user, accessToken || '');
      setSuccess('Profile updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 select-text">
      {/* Left side: Account Info Summary */}
      <div className="md:col-span-5 p-8 rounded-2xl bg-[#121216]/80 border border-[#1f1f2e] space-y-6 self-start">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 text-2xl font-bold">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="border-t border-[#1f1f2e] pt-6 grid grid-cols-1 gap-4">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</span>
            <span className="text-sm font-semibold text-white capitalize">{user?.role}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Account ID</span>
            <span className="text-xs text-slate-400 font-mono break-all">{user?.id}</span>
          </div>
        </div>
      </div>

      {/* Right side: Edit Settings Form */}
      <div className="md:col-span-7 p-8 rounded-2xl bg-[#121216]/80 border border-[#1f1f2e] space-y-6">
        <h3 className="text-lg font-bold text-white">Account Settings</h3>
        <p className="text-xs text-slate-400">Update your username or reset your password. You must verify your identity with your current password to save changes.</p>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="update-username" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="h-5 w-5" />
              </div>
              <input
                id="update-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                placeholder="new_username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="update-new-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              New Password (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="update-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                placeholder="•••••••• (Leave blank to keep current)"
              />
            </div>
          </div>

          <div className="border-t border-[#1f1f2e] pt-4">
            <label htmlFor="update-old-password" className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
              Current Password (Required)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="update-old-password"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="block w-full rounded-xl border border-rose-500/30 bg-[#0c0c0f] py-3 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm transition-all"
                placeholder="Enter current password to authorize changes"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 px-4 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-indigo-500/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt silent refresh
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
        
        const profileResponse = await api.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        setAuth(profileResponse.data.user, accessToken);
      } catch (err) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setAuth, clearAuth, setLoading]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Layout>
                <ProblemList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Leaderboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems/:slug"
          element={
            <ProtectedRoute>
              <Layout>
                <ProblemDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
