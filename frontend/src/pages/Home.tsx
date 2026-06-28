
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { StaggeredGrid, BentoItem } from '../components/ui/staggered-grid';
import MetallicPaint from '../components/MetallicPaint/MetallicPaint';
import logo from '../components/MetallicPaint/logo.svg';
import {
  Sparkles,
  Terminal,
  BarChart2,
  ArrowRight,
  ChevronDown,
  Cpu,
  Shield,
  Layers
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  // Grid Image assets
  const gridImages = [
    '/images/landing/bg_code_1.png',
    '/images/landing/bg_tech_2.png',
    '/images/landing/bg_server_3.png',
    '/images/landing/bg_abstract_4.png'
  ];

  // Grid Bento Items
  const bentoItems: BentoItem[] = [
    {
      id: 'ai-hints',
      title: 'AI Hint Engine',
      subtitle: 'Progressive hints',
      description: 'Get tailored, progressive suggestions powered by Gemini when you run into walls, avoiding flat out spoilers.',
      icon: <Sparkles className="h-5 w-5" />,
      image: '/images/landing/bg_code_1.png'
    },
    {
      id: 'sandbox',
      title: 'Docker Isolation',
      subtitle: 'Secure execution',
      description: 'Run C++, Python, or Java in a sub-second secure sandbox environment built with containerized worker queues.',
      icon: <Terminal className="h-5 w-5" />,
      image: '/images/landing/bg_server_3.png'
    },
    {
      id: 'analytics',
      title: 'Deep Analytics',
      subtitle: 'Detailed metrics',
      description: 'Track execution stats, memory usage, accepted rates, and visualize weekly coding achievements.',
      icon: <BarChart2 className="h-5 w-5" />,
      image: '/images/landing/bg_tech_2.png'
    }
  ];



  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans select-text overflow-x-hidden relative pb-16">

      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Floating grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e10_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e10_1px,transparent_1px)] bg-[size:4rem_4rem] -z-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-[#1f1f2e]/60 bg-[#0a0a0c]/70 backdrop-blur-md sticky top-0 z-[100] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl">
            <div className="metallic-logo h-10 w-[200px] select-none pointer-events-none">
              <MetallicPaint
                imageSrc={logo}
                speed={0.12}
                liquid={0.75}
                brightness={2}
                contrast={0.5}
                tintColor="#a5b4fc"
              />
            </div>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#features" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
              Features
            </a>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section containing StaggeredGrid */}
      <section className="relative w-full flex flex-col items-center pt-8">
        <div className="max-w-7xl w-full px-6 flex flex-col items-center text-center">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 animate-pulse">
            Next-Gen Competitive Coding
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mt-4 max-w-3xl leading-tight">
            Level up your algorithmic skills with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              AI-driven insights
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mt-4 font-medium leading-relaxed">
            Solve challenges in our containerized sandbox, receive progressive, spoiler-free hints, and rank up on the global leaderboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/problems"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all uppercase tracking-wider flex items-center gap-2"
              >
                Browse Coding Challenges <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all uppercase tracking-wider flex items-center gap-2"
                >
                  Create Account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-[#121216] hover:bg-[#181824] text-sm font-bold text-slate-300 border border-zinc-800 hover:text-white transition-all uppercase tracking-wider"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center text-slate-500 animate-bounce">
            <span className="text-[10px] uppercase font-bold tracking-widest">Scroll to explore</span>
            <ChevronDown className="h-4 w-4 mt-1" />
          </div>
        </div>

        {/* The Animated Staggered Grid */}
        <div className="w-full max-w-7xl px-4 mt-4">
          <StaggeredGrid
            images={gridImages}
            bentoItems={bentoItems}
            centerText="CODEARENA"
            showFooter={false}
          />
        </div>
      </section>

      {/* Detailed Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 w-full border-t border-[#1f1f2e]/40 mt-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Everything you need to master coding interviews
          </h2>
          <p className="text-slate-400 text-sm">
            We built CodeArena with focus on low latency, isolation security, and custom AI feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Card 1: AI */}
          <div className="p-6 rounded-2xl bg-[#121216]/50 border border-[#1f1f2e] space-y-4 hover:border-indigo-500/20 hover:bg-[#121216]/70 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-all">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Gemini Hints</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Stuck on a tricky edge case or need help optimization? Get progressive prompts, pseudocode references, or complexity reviews directly from Gemini.
            </p>
          </div>

          {/* Card 2: Docker */}
          <div className="p-6 rounded-2xl bg-[#121216]/50 border border-[#1f1f2e] space-y-4 hover:border-indigo-500/20 hover:bg-[#121216]/70 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-all">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Secure Docker Worker</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every code execution runs in an isolated Linux sandbox container utilizing worker queues, preventing system exploits while processing submissions in under 300ms.
            </p>
          </div>

          {/* Card 3: Metrics */}
          <div className="p-6 rounded-2xl bg-[#121216]/50 border border-[#1f1f2e] space-y-4 hover:border-indigo-500/20 hover:bg-[#121216]/70 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:scale-105 transition-all">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Advanced Progress Logs</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track metrics by topics (e.g. Arrays, Dynamic Programming), analyze memory consumption over time, and compare runtimes to find performance bottlenecks.
            </p>
          </div>
        </div>
      </section>


      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-12 text-center text-slate-600 text-xs border-t border-[#1f1f2e]/40 w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
        <p>&copy; {new Date().getFullYear()} CodeArena. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
        </div>
      </footer>

    </div>
  );
}
