import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, User, AlertTriangle, Terminal, ChevronLeft } from 'lucide-react';
import { PerspectiveGrid } from '../components/ui/perspective-grid';
import { AnimatedButton } from '../components/ui/animated-button';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all details.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post('/auth/register', { username, email, password });
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
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
            Join the Arena today
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Create an account to start tracking code statistics, practice interviews with automated evaluations, and learn algorithms.
          </p>
        </div>
      </div>

      {/* Right Frame - Register Card Box */}
      <div className="w-full lg:w-[36%] min-h-screen flex items-center justify-center p-6 sm:p-12 bg-zinc-950/40 border-l border-zinc-900/60 z-10 backdrop-blur-md">

        {/* Ambient background glows for smaller viewports */}
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800/5 to-zinc-700/5 lg:hidden pointer-events-none -z-10" />

        <div className="w-full max-w-sm space-y-6 z-10">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-zinc-900 text-zinc-400 mb-4 border border-zinc-800 lg:hidden">
              <Terminal className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Join <span className="text-zinc-250 font-semibold">CodeArena</span> to compete and master coding interviews.
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-8 rounded-md shadow-2xl space-y-5 backdrop-blur-md">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-md bg-red-950/20 border border-red-900/40 text-red-400 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-zinc-800 bg-black/60 py-3 pl-10 pr-4 text-white placeholder-zinc-650 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-md border border-zinc-800 bg-black/60 py-3 pl-10 pr-4 text-white placeholder-zinc-650 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm transition-all"
                    placeholder="coder_42"
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
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border border-zinc-805 bg-[#07070a] py-3 pl-10 pr-4 text-white placeholder-zinc-650 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 text-sm transition-all"
                    placeholder="••••••••"
                  />
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
                  'Create Account'
                )}
              </AnimatedButton>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-zinc-200 hover:text-white underline underline-offset-4 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
