import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Metrics {
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  totalAttempted: number;
  acceptanceRate: number;
  currentStreak: number;
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
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>({});
  const [submissionsByDate, setSubmissionsByDate] = useState<Record<string, number>>({});
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [availableProblems, setAvailableProblems] = useState<any[]>([]);
  const [isFetchingProblems, setIsFetchingProblems] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<Record<string, { title: string; slug: string; completed: boolean }>>({});
  const [dailyGoalList, setDailyGoalList] = useState<{ id: string; title: string; slug: string; completed: boolean }[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any | null>(null);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`codearena_daily_goal_list_${user.id}`);
      if (saved) {
        try {
          setDailyGoalList(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user?.id]);

  const saveDailyGoal = (list: { id: string; title: string; slug: string; completed: boolean }[]) => {
    if (!user?.id) return;
    setDailyGoalList(list);
    localStorage.setItem(`codearena_daily_goal_list_${user.id}`, JSON.stringify(list));
  };

  const toggleProblemCompletion = (problemId: string) => {
    const updated = dailyGoalList.map(item => 
      item.id === problemId ? { ...item, completed: !item.completed } : item
    );
    saveDailyGoal(updated);
  };

  const clearDailyGoal = () => {
    if (!user?.id) return;
    setDailyGoalList([]);
    localStorage.removeItem(`codearena_daily_goal_list_${user.id}`);
    setShowGoalDropdown(false);
  };

  const handleOpenGoalModal = async () => {
    setShowGoalModal(true);
    const selectedMap: Record<string, { title: string; slug: string; completed: boolean }> = {};
    dailyGoalList.forEach(item => {
      selectedMap[item.id] = { title: item.title, slug: item.slug, completed: item.completed };
    });
    setSelectedProblems(selectedMap);

    if (availableProblems.length === 0) {
      setIsFetchingProblems(true);
      try {
        const res = await api.get('/problems', { params: { limit: 100 } });
        setAvailableProblems(res.data.problems || []);
      } catch (err) {
        console.error('Error fetching problems for goal selector:', err);
      } finally {
        setIsFetchingProblems(false);
      }
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, subRes, probRes] = await Promise.all([
          api.get('/users/dashboard'),
          api.get('/users/submissions'),
          api.get('/problems', { params: { limit: 100 } }),
        ]);

        setMetrics(dashRes.data.metrics);
        setTopicProgress(dashRes.data.topicProgress);
        setSubmissionsByDate(dashRes.data.submissionsByDate || {});
        setRecentSubmissions(subRes.data.submissions);

        // Pick a "Daily Challenge" that is stable for the whole day but rotates daily
        const problems = probRes.data.problems || [];
        if (problems.length > 0) {
          const dayIndex = Math.floor(Date.now() / 86400000);
          setDailyChallenge(problems[dayIndex % problems.length]);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Generate heatmap cells from actual submission activity over the last 364 days
  const heatmapCells = Array.from({ length: 364 }).map((_, i) => {
    // End date is today, subtract i days
    const d = new Date();
    d.setDate(d.getDate() - (363 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = submissionsByDate[dateStr] || 0;

    let colorClass = 'bg-surface-container-highest';
    if (count >= 5) colorClass = 'bg-secondary';
    else if (count >= 3) colorClass = 'bg-secondary/60';
    else if (count >= 1) colorClass = 'bg-secondary/30';

    return (
      <div
        key={i}
        className={`grid-contribution-cell ${colorClass}`}
        title={`${count} submission(s) on ${d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`}
      />
    );
  });

  const getVerdictLabel = (v: string) => {
    switch (v) {
      case 'ACCEPTED': return 'Accepted';
      case 'WRONG_ANSWER': return 'Wrong Answer';
      case 'COMPILATION_ERROR': return 'Compilation Error';
      case 'TIME_LIMIT_EXCEEDED': return 'Time Limit Exceeded';
      case 'RUNTIME_ERROR': return 'Runtime Error';
      default: return v.replace(/_/g, ' ');
    }
  };

  const getVerdictIcon = (v: string) =>
    v === 'ACCEPTED' ? 'check_circle' : 'cancel';

  const getVerdictColor = (v: string) =>
    v === 'ACCEPTED'
      ? 'bg-emerald-500/10 text-emerald-400'
      : 'bg-error-container/10 text-error';

  const getVerdictTextClass = (v: string) =>
    v === 'ACCEPTED' ? 'text-on-surface font-semibold' : 'text-error font-semibold';

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Sorted topic entries by count descending
  const topicEntries = Object.entries(topicProgress).sort(([, a], [, b]) => b - a);
  const topLanguages = topicEntries.slice(0, 5);
  const maxTopicCount = topLanguages.length > 0 ? topLanguages[0][1] : 1;

  return (
    <div className="p-gutter">
      {/* Hero / Welcome Header */}
      <section className="mb-xl flex justify-between items-end">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
            Welcome back, {user?.username}
          </h1>
          <p className="text-on-surface-variant">
            {metrics
              ? `You've solved ${metrics.totalSolved} problems total. Keep up the momentum!`
              : 'Start solving problems to track your progress!'}
          </p>
        </div>
        <div className="hidden lg:block relative z-30">
          {dailyGoalList.length > 0 ? (
            <div className="flex items-center gap-xs">
              {/* Main Daily Goal Toggle Button */}
              <button
                onClick={() => setShowGoalDropdown(!showGoalDropdown)}
                className="flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-xl border border-outline-variant hover:border-primary transition-all text-left active:scale-95 shadow-md"
              >
                <span
                  className="material-symbols-outlined text-secondary animate-pulse"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span className="font-label-md text-label-md text-on-surface select-none">
                  Daily goal: <span className="text-secondary font-bold">
                    {dailyGoalList.filter(p => p.completed).length}/{dailyGoalList.length} Solved
                  </span>
                </span>
                <span className="material-symbols-outlined scale-75 text-on-surface-variant">
                  {showGoalDropdown ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Edit / Clear quick triggers */}
              <button
                onClick={handleOpenGoalModal}
                className="p-2 bg-surface-container-high border border-outline-variant rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-variant transition-all active:scale-95"
                title="Edit Daily Goal"
              >
                <span className="material-symbols-outlined scale-90">edit</span>
              </button>
              <button
                onClick={clearDailyGoal}
                className="p-2 bg-surface-container-high border border-outline-variant rounded-xl text-on-surface-variant hover:text-error hover:bg-surface-variant transition-all active:scale-95"
                title="Clear Daily Goal"
              >
                <span className="material-symbols-outlined scale-90">delete</span>
              </button>

              {/* Goal Checklist Dropdown overlay */}
              {showGoalDropdown && (
                <div className="absolute right-0 top-12 w-80 bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-lg z-50 animate-fadeIn space-y-md">
                  <div className="flex justify-between items-center pb-sm border-b border-outline-variant">
                    <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold tracking-wider">Goal Checklist</span>
                    <span className="text-[10px] bg-secondary-container text-on-secondary-container px-xs rounded font-bold">
                      {Math.round((dailyGoalList.filter(p => p.completed).length / dailyGoalList.length) * 100)}% Done
                    </span>
                  </div>

                  <div className="space-y-sm max-h-60 overflow-y-auto custom-scrollbar">
                    {dailyGoalList.map((item) => (
                      <div key={item.id} className="flex items-start gap-md py-xs group">
                        <button
                          onClick={() => toggleProblemCompletion(item.id)}
                          className="mt-0.5 text-on-surface-variant hover:text-primary transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined scale-90" style={{ fontVariationSettings: item.completed ? "'FILL' 1" : "" }}>
                            {item.completed ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/problems/${item.slug}`}
                            className={`block text-xs font-semibold truncate hover:text-primary transition-colors ${
                              item.completed ? 'text-on-surface-variant/50 line-through' : 'text-on-surface'
                            }`}
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowGoalDropdown(false)}
                    className="block w-full text-center py-xs text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant hover:border-on-surface hover:text-white rounded-lg transition-colors"
                  >
                    Close Panel
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Pending State
            <button
              onClick={handleOpenGoalModal}
              className="flex items-center gap-sm bg-surface-container-high px-md py-sm rounded-xl border border-outline-variant hover:border-primary hover:bg-surface-variant/30 active:scale-95 transition-all text-left group"
            >
              <span
                className="material-symbols-outlined text-secondary/60 group-hover:text-secondary group-hover:animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-white select-none">
                Daily goal: <span className="text-on-surface-variant/60 italic font-normal">Pending (Click to set)</span>
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {/* Solved Problems Card */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">task_alt</span>
          </div>
          <div className="flex justify-between items-start mb-md">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase">Solved Problems</p>
            {metrics && metrics.totalSolved > 0 && (
              <span className="text-emerald-400 font-code-sm">+{metrics.totalSolved} total</span>
            )}
          </div>
          <div className="flex items-baseline gap-xs">
            <h2 className="font-headline-xl text-headline-xl text-on-surface">
              {metrics?.totalSolved ?? 0}
            </h2>
            <span className="text-on-surface-variant font-body-sm">
              / {metrics?.totalAttempted ?? 0} attempted
            </span>
          </div>
          <div className="mt-md h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${metrics ? Math.min((metrics.totalSolved / Math.max(metrics.totalAttempted, 1)) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">local_fire_department</span>
          </div>
          <div className="flex justify-between items-start mb-md">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase">Current Streak</p>
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <div className="flex items-baseline gap-xs">
            <h2 className="font-headline-xl text-headline-xl text-on-surface">
              {metrics?.currentStreak ?? 0}
            </h2>
            <span className="text-on-surface-variant font-body-sm">days</span>
          </div>
          <p className="text-on-surface-variant font-body-sm mt-sm">
            Submit a solution today to maintain your streak!
          </p>
        </div>

        {/* Acceptance Rate Card */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">monitoring</span>
          </div>
          <div className="flex justify-between items-start mb-md">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase">Acceptance Rate</p>
            <span className="text-primary font-code-sm">
              {metrics && metrics.acceptanceRate >= 70 ? 'Great!' : 'Keep Going'}
            </span>
          </div>
          <div className="flex items-baseline gap-xs">
            <h2 className="font-headline-xl text-headline-xl text-on-surface">
              {metrics?.acceptanceRate ?? 0}
            </h2>
            <span className="text-on-surface-variant font-body-sm">%</span>
          </div>
          <p className="text-on-surface-variant font-body-sm mt-sm">
            {metrics?.totalSolved ?? 0} accepted / {metrics?.totalAttempted ?? 0} submitted
          </p>
        </div>

        {/* Difficulty Breakdown Card */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">emoji_events</span>
          </div>
          <div className="flex justify-between items-start mb-md">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase">Difficulty Split</p>
            <span
              className="material-symbols-outlined text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
          </div>
          <div className="space-y-2 mt-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold">Easy</span>
              <span className="text-on-surface font-bold">{metrics?.easySolved ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold">Medium</span>
              <span className="text-on-surface font-bold">{metrics?.mediumSolved ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-error font-semibold">Hard</span>
              <span className="text-on-surface font-bold">{metrics?.hardSolved ?? 0}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section: Activity & Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
        {/* Main Dashboard Feed */}
        <div className="xl:col-span-2 space-y-gutter">
          {/* Contribution Heatmap (GitHub Style) */}
          <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Submission Activity
              </h3>
              <div className="flex gap-sm text-on-surface-variant font-body-sm items-center">
                <span>Less</span>
                <div className="flex gap-[2px]">
                  <div className="w-3 h-3 bg-surface-container-highest rounded-sm" />
                  <div className="w-3 h-3 bg-secondary/30 rounded-sm" />
                  <div className="w-3 h-3 bg-secondary/60 rounded-sm" />
                  <div className="w-3 h-3 bg-secondary rounded-sm" />
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-sm custom-scrollbar">
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] min-w-[700px]">
                {heatmapCells}
              </div>
            </div>
            <div className="mt-md flex justify-between font-label-md text-label-md text-on-surface-variant uppercase">
              <span>Last 52 weeks</span>
              <span>
                Total Submissions: {metrics?.totalAttempted ?? 0}
              </span>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Recent Submissions
              </h3>
              <Link
                to="/problems"
                className="text-primary font-label-md text-label-md uppercase tracking-widest hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-outline-variant">
              {recentSubmissions.length === 0 ? (
                <div className="p-lg text-center text-on-surface-variant text-body-sm italic">
                  You haven't submitted any solutions yet.{' '}
                  <Link to="/problems" className="text-primary hover:underline">
                    Start solving now!
                  </Link>
                </div>
              ) : (
                recentSubmissions.slice(0, 5).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-lg flex items-center justify-between hover:bg-surface-variant/30 transition-colors"
                  >
                    <div className="flex items-center gap-md">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${getVerdictColor(sub.verdict)}`}
                      >
                        <span className="material-symbols-outlined">
                          {getVerdictIcon(sub.verdict)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-body-md text-on-surface font-semibold">
                          <Link
                            to={`/problems/${sub.problem.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {sub.problem.title}
                          </Link>
                        </h4>
                        <p className="text-on-surface-variant text-body-sm">
                          {sub.language}
                          {sub.executionTime !== null && ` • ${sub.executionTime} ms`}
                          {sub.memoryUsed !== null &&
                            ` • ${(sub.memoryUsed / 1024).toFixed(1)} MB`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-code-md ${getVerdictTextClass(sub.verdict)}`}>
                        {getVerdictLabel(sub.verdict)}
                      </p>
                      <p className="text-on-surface-variant text-[12px]">
                        {new Date(sub.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <aside className="space-y-gutter">
          {/* Topic / Language Proficiency Card */}
          <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
              Top Topics
            </h3>
            <div className="space-y-md">
              {topLanguages.length === 0 ? (
                <p className="text-on-surface-variant text-body-sm italic text-center py-4">
                  No topic data yet. Solve problems to track progress.
                </p>
              ) : (
                topLanguages.map(([topic, count], index) => {
                  const colorClass =
                    index === 0
                      ? 'bg-primary'
                      : index === 1
                        ? 'bg-secondary'
                        : 'bg-tertiary';
                  return (
                    <div key={topic} className="space-y-xs">
                      <div className="flex justify-between font-label-md text-label-md">
                        <span>{topic}</span>
                        <span className="text-on-surface">{count} solved</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} transition-all duration-500`}
                          style={{
                            width: `${Math.min((count / maxTopicCount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-lg opacity-10">
              <span className="material-symbols-outlined text-6xl">lightbulb</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-md">
              Daily Challenge
            </h3>
            <div className="space-y-md relative z-10">
              {dailyChallenge ? (
                <div className="bg-surface-container p-md rounded-lg border border-outline-variant">
                  <h4 className="font-body-md text-on-surface font-bold mb-xs">
                    {dailyChallenge.title}
                  </h4>
                  <div className="flex gap-sm mb-md items-center">
                    <span className={`font-code-sm px-xs rounded capitalize ${
                      dailyChallenge.difficulty === 'HARD'
                        ? 'text-error bg-error-container/20'
                        : dailyChallenge.difficulty === 'MEDIUM'
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-secondary bg-secondary-container/20'
                    }`}>
                      {dailyChallenge.difficulty.toLowerCase()}
                    </span>
                    {dailyChallenge.tags?.[0] && (
                      <span className="font-code-sm text-on-surface-variant">{dailyChallenge.tags[0].name}</span>
                    )}
                  </div>
                  <Link
                    to={`/problems/${dailyChallenge.slug}`}
                    className="block w-full py-sm bg-primary text-center text-on-primary rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all"
                  >
                    Solve Now
                  </Link>
                </div>
              ) : (
                <div className="bg-surface-container p-md rounded-lg border border-outline-variant text-center">
                  <p className="font-body-sm text-on-surface-variant mb-md">No challenge available right now.</p>
                  <Link
                    to="/problems"
                    className="block w-full py-sm bg-primary text-center text-on-primary rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all"
                  >
                    Browse Problems
                  </Link>
                </div>
              )}
              <p className="text-body-sm text-on-surface-variant italic">
                Solving this challenge grants +50 XP and 2 Streak Protectors.
              </p>
            </div>
          </div>

          {/* Community Contest Card */}
          <div className="bg-surface-container rounded-xl p-lg border border-outline-variant text-center">
            <div className="w-16 h-16 mx-auto mb-md flex items-center justify-center rounded-full bg-tertiary-container/20 text-tertiary">
              <span className="material-symbols-outlined text-4xl">diversity_3</span>
            </div>
            <h4 className="font-headline-md text-headline-md text-on-surface mb-sm">
              <span className="logo-font text-primary">CodeArena</span> Weekly Contest
            </h4>
            <p className="text-on-surface-variant text-body-sm mb-md">
              Compete with 4,000+ developers for global rankings and prizes.
            </p>
            <button className="font-label-md text-label-md text-tertiary border border-tertiary/50 px-lg py-sm rounded-lg hover:bg-tertiary/10 transition-all">
              Register for free
            </button>
          </div>
        </aside>
      </div>

      {/* Daily Goal Config Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
          <div className="bg-[#121216]/95 border border-[#1f1f2e] p-lg rounded-2xl max-w-lg w-full mx-4 shadow-2xl space-y-lg flex flex-col h-[550px] transform transition-all duration-300">
            <div className="flex justify-between items-center pb-md border-b border-[#1f1f2e]">
              <div>
                <h3 className="text-lg font-bold text-white">Configure Daily Goal</h3>
                <p className="text-[11px] text-slate-400">Select the problems you want to commit to solving today.</p>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search problems */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <span className="material-symbols-outlined scale-75">search</span>
              </span>
              <input
                type="text"
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                placeholder="Search coding problems..."
                className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-2.5 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto border border-[#1f1f2e] bg-[#0c0c0f]/60 rounded-xl p-md custom-scrollbar">
              {isFetchingProblems ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-[11px] italic">Fetching platform problems...</span>
                </div>
              ) : (
                <div className="divide-y divide-[#1f1f2e]">
                  {availableProblems
                    .filter((p) => p.title.toLowerCase().includes(problemSearch.toLowerCase()))
                    .map((problem) => {
                      const isSelected = !!selectedProblems[problem.id];
                      return (
                        <div
                          key={problem.id}
                          onClick={() => {
                            const newSelected = { ...selectedProblems };
                            if (isSelected) {
                              delete newSelected[problem.id];
                            } else {
                              newSelected[problem.id] = {
                                title: problem.title,
                                slug: problem.slug,
                                completed: false,
                              };
                            }
                            setSelectedProblems(newSelected);
                          }}
                          className={`flex items-center justify-between p-sm cursor-pointer hover:bg-[#121216]/50 transition-colors ${
                            isSelected ? 'bg-indigo-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-md min-w-0">
                            <span className="material-symbols-outlined text-slate-400 select-none font-bold">
                              {isSelected ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{problem.title}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{problem.difficulty.toLowerCase()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex gap-3 pt-md border-t border-[#1f1f2e]">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2 px-4 rounded-xl bg-[#121216] border border-[#1f1f2e] hover:bg-[#181824] text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const goalList = Object.entries(selectedProblems).map(([id, item]) => ({
                    id,
                    title: item.title,
                    slug: item.slug,
                    completed: item.completed,
                  }));
                  saveDailyGoal(goalList);
                  setShowGoalModal(false);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-950/20"
              >
                Commit Goal ({Object.keys(selectedProblems).length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
