import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Lock, Mail, AlertTriangle, Terminal, User, ChevronLeft } from 'lucide-react';
import { PerspectiveGrid } from '../components/ui/perspective-grid';
import { AnimatedButton } from '../components/ui/animated-button';

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
    <div className="flex min-h-screen bg-[#07070a] relative overflow-hidden font-sans select-text">

      {/* Floating Back to Home button on the top right */}
      <Link to="/" className="absolute top-8 right-8 z-20 flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900/40 border border-zinc-800 px-3.5 py-2 rounded-md backdrop-blur-md">
        <ChevronLeft className="h-4.5 w-4.5" />
        Back to Home
      </Link>

      {/* Left Frame - PerspectiveGrid Animation */}
      <div className="hidden lg:block lg:w-[64%] h-screen relative select-none shrink-0">
        <PerspectiveGrid className="w-full h-full" gridSize={40} showOverlay={true} fadeRadius={92} />

        {/* Floating Logo overlay */}
        <Link to="/" className="absolute top-8 left-8 z-20 flex items-center gap-2.5 font-bold text-xl pointer-events-auto group">
          <span className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-all">
            <Terminal className="h-5 w-5" />
          </span>
          <span className="text-zinc-300 font-medium tracking-tight group-hover:text-white transition-all">
            CodeArena
          </span>
        </Link>

        {/* Dynamic promotional hero text on the grid */}
        <div className="absolute bottom-16 left-12 z-20 max-w-lg space-y-3 pointer-events-none">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            The Competitive Programming Workspace
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Practice algorithms, secure runs in our containerized sandbox, receive AI-driven hints, and sync telemetry automatically to your profile.
          </p>
        </div>
      </div>

      {/* Right Frame - Login Card Box */}
      <div className="w-full lg:w-[36%] min-h-screen flex items-center justify-center p-6 sm:p-12 bg-zinc-950/40 border-l border-zinc-900/60 z-10 backdrop-blur-md">

        {/* Ambient background glows for smaller viewports */}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800/5 to-zinc-700/5 lg:hidden pointer-events-none -z-10" />

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-zinc-900 text-zinc-400 mb-4 border border-zinc-800 lg:hidden">
              <Terminal className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back to <span className="text-zinc-200 font-bold">CodeArena</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Log in to solve problems, practice interviews, and improve your skills.
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-8 rounded-md shadow-2xl space-y-6 backdrop-blur-md">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-md bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="identifier" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
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
                    className="block w-full rounded-md border border-zinc-800 bg-black/60 py-3 pl-10 pr-4 text-white placeholder-zinc-650 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm transition-all"
                    placeholder="name@example.com or username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
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
                    className="block w-full rounded-md border border-zinc-800 bg-black/60 py-3 pl-10 pr-4 text-white placeholder-zinc-650 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <AnimatedButton
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center py-3 bg-black border border-zinc-800"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </AnimatedButton>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-zinc-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-zinc-200 hover:text-white underline underline-offset-4 transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
