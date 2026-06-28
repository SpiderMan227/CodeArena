import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Agentation } from 'agentation';
import { useAuthStore } from './store/authStore';
import api from './services/api';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemList from './pages/ProblemList';
import AdminDashboard from './pages/AdminDashboard';
import ProblemDetail from './pages/ProblemDetail';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import { LogOut, Lock, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FlipText } from './components/ui/flip-text';

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

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

// Layout wrapper
function Layout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('codearena_theme');
    if (saved) {
      return saved === 'dark';
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('codearena_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('codearena_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Failed to log out cleanly', err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="font-body-md text-body-md overflow-x-hidden min-h-screen bg-background text-on-background relative">
      {/* SideNavBar Shell */}
      <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col py-lg z-50 animate-fadeIn">
        <div className="px-md mb-xl flex items-center gap-sm">
          <Link to="/dashboard" className="logo-font text-[28px] text-primary select-none pointer-events-none">
            <FlipText separator="">{"<0de4rena"}</FlipText>
          </Link>
        </div>
        <div className="flex-1 space-y-1 px-sm">
          {/* Dashboard */}
          <Link
            className={`flex items-center gap-md px-md py-sm rounded-lg cursor-pointer active:scale-95 transition-transform ${isActive('/dashboard') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors duration-200'}`}
            to="/dashboard"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </Link>
          {/* Problems */}
          <Link
            className={`flex items-center gap-md px-md py-sm rounded-lg cursor-pointer active:scale-95 transition-transform ${isActive('/problems') || location.pathname.startsWith('/problems/') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors duration-200'}`}
            to="/problems"
          >
            <span className="material-symbols-outlined">code</span>
            <span className="font-body-md text-body-md">Problems</span>
          </Link>
          {/* Leaderboard */}
          <Link
            className={`flex items-center gap-md px-md py-sm rounded-lg cursor-pointer active:scale-95 transition-transform ${isActive('/leaderboard') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors duration-200'}`}
            to="/leaderboard"
          >
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="font-body-md text-body-md">Leaderboard</span>
          </Link>
          {/* Profile */}
          <Link
            className={`flex items-center gap-md px-md py-sm rounded-lg cursor-pointer active:scale-95 transition-transform ${isActive('/profile') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors duration-200'}`}
            to="/profile"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-body-md text-body-md">Profile</span>
          </Link>
        </div>
        <div className="space-y-1 px-sm">
          <Link
            className={`flex items-center gap-md px-md py-sm rounded-lg cursor-pointer active:scale-95 transition-transform ${isActive('/profile') ? 'bg-surface-variant text-on-surface' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors duration-200'}`}
            to="/profile"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </Link>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface rounded-lg cursor-pointer active:scale-95 transition-transform transition-colors duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md text-body-md text-left">Logout</span>
          </button>
        </div>
      </nav>

      {/* TopNavBar Shell */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-gutter h-16 ml-64">
        <div className="flex-1" />
        <div className="flex items-center gap-lg ml-gutter">
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </button>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-sm pl-md border-l border-outline-variant cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface">{user?.username}</p>
                <p className="text-[10px] text-primary uppercase tracking-wider font-bold">
                  {user?.role === 'ADMIN' ? 'Admin' : 'Developer'}
                </p>
              </div>
              {user?.avatarUrl ? (
                <img
                  alt="User avatar"
                  className="w-10 h-10 rounded-full border-2 border-primary/30 object-cover"
                  src={user.avatarUrl}
                />
              ) : (
                <div className="w-10 h-10 rounded-full border border-outline-variant/30 bg-transparent" />
              )}
            </button>

            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 top-12 w-48 bg-surface-container-high border border-outline-variant rounded-xl shadow-xl py-xs z-50 animate-fadeIn">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors text-xs font-semibold w-full text-left"
                  >
                    <span className="material-symbols-outlined scale-75">settings</span>
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-sm px-md py-sm text-error hover:bg-error-container/10 transition-colors text-xs font-semibold w-full text-left"
                  >
                    <span className="material-symbols-outlined scale-75 text-error">logout</span>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-16 min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-[#121216]/95 border border-zinc-800 p-8 rounded-2xl max-w-sm w-full mx-4 shadow-2xl space-y-6 text-center transform transition-all duration-300 animate-in zoom-in-95">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2">
              <LogOut className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Do you actually want to log out of your session on CodeArena?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white text-slate-300 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-650 hover:from-rose-600 hover:to-red-750 text-white text-sm font-semibold transition-all shadow-lg shadow-rose-950/20"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

function UserProfile() {
  const { user, accessToken, setAuth } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
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
        { username, avatarUrl: avatarUrl || null, newPassword, oldPassword },
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
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 text-2xl font-bold">
              {user?.username.slice(0, 2).toUpperCase()}
            </div>
          )}
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
            <label htmlFor="update-avatar" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Profile Picture URL (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <span className="material-symbols-outlined text-[20px]">image</span>
              </div>
              <input
                id="update-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

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
            <Home />
          }
        />
        <Route
          path="/dashboard"
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
      {import.meta.env.DEV && <Agentation />}
    </Router>
  );
}
