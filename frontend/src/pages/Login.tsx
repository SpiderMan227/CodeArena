import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Lock, Mail, AlertTriangle, Terminal, User } from 'lucide-react';
import Lightfall from '../components/Lightfall/Lightfall';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', { identifier, password });
      setAuth(response.data.user, response.data.accessToken);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 403) {
        // User is unverified — email might be in the error response or we use the identifier
        const email = identifier.includes('@') ? identifier : '';
        navigate('/verify-email', { state: { email } });
        return;
      }
      setError(err.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic 3D Lightfall background */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <Lightfall
          colors={['#6366f1', '#8b5cf6', '#a855f7', '#ec4899']}
          backgroundColor="#0a0a0c"
          speed={0.8}
          streakCount={3}
          streakWidth={1.5}
          streakLength={1.2}
          glow={1.5}
          density={0.5}
          twinkle={0.8}
          zoom={2.5}
          backgroundGlow={0.3}
          opacity={1.0}
          mouseInteraction={true}
          mouseStrength={0.8}
          mouseRadius={0.9}
        />
      </div>

      {/* Premium ambient light backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mb-4 border border-indigo-500/20">
            <Terminal className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back to <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">CodeArena</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Log in to solve problems, practice interviews, and improve your skills.
          </p>
        </div>

        <div className="bg-[#121216]/80 backdrop-blur-xl border border-[#1f1f2e] p-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  {identifier.includes('@') ? <Mail className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="name@example.com or username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 px-4 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
