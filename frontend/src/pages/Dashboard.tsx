import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Flame, Percent, CheckCircle2, ChevronRight, Activity, Cpu, Terminal } from 'lucide-react';
import BounceCards from '../components/BounceCards/BounceCards';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import { ExpandableBentoGrid } from '../components/ui/expandable-bento-grid';

interface Metrics {
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalAttempted: number;
  acceptanceRate: number;
  currentStreak: number;
}

interface ActivityItem {
  day: string;
  submissions: number;
}

interface Submission {
  id: string;
  verdict: string;
  language: string;
  executionTime: number;
  memoryUsed: number;
  createdAt: string;
  problem: {
    title: string;
    slug: string;
  };
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>({});
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, subRes] = await Promise.all([
          api.get('/users/dashboard'),
          api.get('/users/submissions'),
        ]);

        const fetchedMetrics = dashRes.data.metrics;
        setMetrics(fetchedMetrics);
        setActivity(dashRes.data.weeklyActivity);
        setTopicProgress(dashRes.data.topicProgress);
        setRecentSubmissions(subRes.data.submissions);

        // Check if onboarding needs to be displayed
        if (user) {
          const onboardedKey = `onboarded_${user.id}`;
          const hasOnboarded = localStorage.getItem(onboardedKey);
          // Trigger onboarding if they haven't seen it AND they have 0 attempts
          if (!hasOnboarded && (!fetchedMetrics || fetchedMetrics.totalAttempted === 0)) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleCompleteOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarded_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'ACCEPTED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'WRONG_ANSWER': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'COMPILATION_ERROR': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0a0a0c]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isFirstTime = !metrics || metrics.totalAttempted === 0;

  // Determine if today's streak is active
  const hasSubmittedToday = recentSubmissions.some((sub) => {
    const subDate = new Date(sub.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    return subDate === todayDate;
  });

  const bentoGridItems = metrics ? [
    {
      id: 'problems-solved',
      title: 'Problems Solved',
      subtitle: `${metrics.totalSolved}`,
      description: `out of ${metrics.totalAttempted} attempted`,
      icon: <Award className="h-5 w-5" />,
      content: (
        <div className="space-y-4 w-full">
          <p className="text-xs text-slate-400">Breakdown of solved problems by difficulty level:</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-500 font-semibold">Easy</span>
                <span className="text-slate-300 font-bold">{metrics.easySolved}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#0c0c0f] overflow-hidden">
                <div
                  style={{ width: `${(metrics.easySolved / (metrics.totalSolved || 1)) * 100}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-500 font-semibold">Medium</span>
                <span className="text-slate-300 font-bold">{metrics.mediumSolved}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#0c0c0f] overflow-hidden">
                <div
                  style={{ width: `${(metrics.mediumSolved / (metrics.totalSolved || 1)) * 100}%` }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-rose-500 font-semibold">Hard</span>
                <span className="text-slate-300 font-bold">{metrics.hardSolved}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#0c0c0f] overflow-hidden">
                <div
                  style={{ width: `${(metrics.hardSolved / (metrics.totalSolved || 1)) * 100}%` }}
                  className="h-full bg-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'streak',
      title: 'Current Streak',
      subtitle: `${metrics.currentStreak} Days`,
      description: hasSubmittedToday ? 'Today\'s streak completed!' : 'Today\'s streak pending',
      icon: <Flame className={`h-5 w-5 ${hasSubmittedToday ? 'text-amber-500 animate-bounce' : 'text-slate-500'}`} />,
      content: (
        <div className="space-y-4 w-full text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <span className="text-2xl">{hasSubmittedToday ? '🔥' : '⏳'}</span>
            <div>
              <p className="font-bold text-white">
                {hasSubmittedToday ? "Today's Challenge Completed!" : "Pending Submission"}
              </p>
              <p className="text-slate-400 text-[10px] mt-0.5">
                {hasSubmittedToday
                  ? "Great job! You have submitted a solution today to secure your streak."
                  : "Submit a correct solution to any problem today to increment your streak!"}
              </p>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <p className="text-slate-400">Streak milestones are calculated based on consecutive calendar days with at least one compilation check or run submission on the CodeArena sandbox.</p>
          </div>
        </div>
      )
    },
    {
      id: 'acceptance-rate',
      title: 'Acceptance Rate',
      subtitle: `${metrics.acceptanceRate}%`,
      description: 'Accepted vs total submissions',
      icon: <Percent className="h-5 w-5" />,
      content: (
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Solved / Attempted Ratio</span>
            <span className="text-white font-bold">{metrics.totalSolved} / {metrics.totalAttempted}</span>
          </div>
          <div className="h-2 rounded-full bg-[#0c0c0f] overflow-hidden">
            <div
              style={{ width: `${metrics.acceptanceRate}%` }}
              className="h-full bg-indigo-500 transition-all duration-500"
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            Your acceptance rate is the percentage of all compilation evaluations that successfully pass all isolated test inputs in the Docker sandbox. Refactoring code to pass clean on first attempt improves this ratio.
          </p>
        </div>
      )
    },
    {
      id: 'topic-mastery',
      title: 'Topic Mastery',
      subtitle: `${Object.keys(topicProgress).length} Topics`,
      description: 'Algorithmic focus statistics',
      icon: <Cpu className="h-5 w-5" />,
      content: (
        <div className="space-y-4 w-full">
          <p className="text-xs text-slate-400">Algorithmic topics and solved counts:</p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {Object.keys(topicProgress).length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                No topic data. Solve problems to track metrics.
              </div>
            ) : (
              Object.entries(topicProgress).map(([topic, solvedCount]) => {
                const progressPercentage = Math.min((solvedCount / 5) * 100, 100);
                return (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-300">{topic}</span>
                      <span className="text-indigo-400">{solvedCount} solved</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#0c0c0f] overflow-hidden">
                      <div
                        style={{ width: `${progressPercentage}%` }}
                        className="h-full bg-indigo-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )
    }
  ] : [];

  const onboardingImages = [
    '/images/onboarding/welcome.png',
    '/images/onboarding/challenges.png',
    '/images/onboarding/sandbox.png',
    '/images/onboarding/analytics.png',
    '/images/onboarding/leaderboard.png',
  ];

  const onboardingTransforms = [
    'rotate(5deg) translate(-150px)',
    'rotate(0deg) translate(-70px)',
    'rotate(-5deg)',
    'rotate(5deg) translate(70px)',
    'rotate(-5deg) translate(150px)',
  ];

  return (
    <div className="space-y-6 relative overflow-hidden pb-12">
      {/* Dynamic light glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      {/* Greeting Banner */}
      <BorderGlow animated={true} borderRadius={16} backgroundColor="transparent" className="w-full shadow-2xl">
        <div className="p-8 bg-gradient-to-br from-[#121216] to-[#181824] flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              {isFirstTime ? `Welcome, ${user?.username}!` : `Welcome back, ${user?.username}!`}
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Track your coding streaks, review editorial hints, analyze Docker logs, and level up your software engineering abilities.
            </p>
          </div>
          <Link
            to="/problems"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all self-start md:self-center"
          >
            Browse Problems <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </BorderGlow>

      {/* Primary Metrics Grid (Expandable Bento Grid) */}
      {metrics && (
        <div className="my-8">
          <ExpandableBentoGrid items={bentoGridItems} />
        </div>
      )}

      {/* Submission Activity Chart (Full Width) */}
      <BorderGlow borderRadius={16} backgroundColor="#121216" className="w-full shadow-xl">
        <div className="p-6 space-y-4 w-full">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" /> Submission Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Logs of submissions made over the last 7 days.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#1f1f2e', opacity: 0.3 }}
                  contentStyle={{ backgroundColor: '#0c0c0f', borderColor: '#1f1f2e', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}
                  itemStyle={{ color: '#6366f1', fontSize: 12 }}
                />
                <Bar dataKey="submissions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </BorderGlow>

      {/* Recent Submissions Feed */}
      <BorderGlow borderRadius={16} backgroundColor="#121216" className="shadow-xl">
        <div className="p-6 space-y-4 w-full">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Recent Submissions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Review your latest submissions and execution statuses.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1f1f2e]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1f1f2e] bg-[#161622]/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Memory</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f2e] text-xs font-mono text-slate-300">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-sans italic">
                      You have not submitted any solutions yet.
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#1f1f2e]/10 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-white">
                        <Link to={`/problems/${sub.problem.slug}`} className="hover:text-indigo-400 transition-colors">
                          {sub.problem.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${getVerdictStyle(sub.verdict)}`}>
                          {sub.verdict.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {sub.executionTime !== null ? `${sub.executionTime} ms` : '--'}
                      </td>
                      <td className="py-3 px-4">
                        {sub.memoryUsed !== null ? `${(sub.memoryUsed / 1024).toFixed(2)} MB` : '--'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        {new Date(sub.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </BorderGlow>

      {/* Onboarding Overlay with BounceCards */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg transition-all duration-500 animate-fadeIn">
          {/* Ambient glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

          {/* Welcome text */}
          <div className="text-center mb-8 z-10 space-y-3 animate-scaleIn">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-2">
              <Terminal className="h-7 w-7" />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-300 via-white to-purple-400 bg-clip-text text-transparent">
              Welcome to CodeArena
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Here's what you can do on our platform. Hover over the cards to explore!
            </p>
          </div>

          {/* BounceCards */}
          <div className="z-10">
            <BounceCards
              className="onboarding-bounceCards"
              images={onboardingImages}
              containerWidth={600}
              containerHeight={260}
              animationDelay={0.6}
              animationStagger={0.08}
              easeType="elastic.out(1, 0.5)"
              transformStyles={onboardingTransforms}
              enableHover={true}
            />
          </div>

          {/* CTA Button */}
          <div className="mt-12 z-10 flex flex-col items-center gap-4 animate-scaleIn" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
            <button
              onClick={handleCompleteOnboarding}
              className="px-8 py-3 text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all uppercase tracking-wider hover:scale-105 active:scale-95"
            >
              Let's Start Coding!
            </button>
            <button
              onClick={handleCompleteOnboarding}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
