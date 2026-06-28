import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Circle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: Tag[];
}

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  // Unique tags for filtering options
  const availableTags = ['Arrays', 'Strings', 'Dynamic Programming', 'Greedy', 'Math', 'Trees', 'Graphs'];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/users/dashboard');
        setMetrics(response.data.metrics);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/problems', {
          params: {
            search,
            difficulty: difficulty || undefined,
            tag: tag || undefined,
            page,
            limit: 10,
          },
        });
        setProblems(response.data.problems);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProblems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, difficulty, tag, page]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIUM':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'HARD':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-6 relative overflow-hidden animate-fadeIn">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[80px] -z-10" />

      <div>
        <h2 className="text-2xl font-extrabold text-white">Problems</h2>
        <p className="text-sm text-on-surface-variant mt-1">Choose a task, refine your algorithms, and test against robust cases.</p>
      </div>

      {/* Page Header / Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        <div className="p-lg bg-surface-container-low rounded-xl border border-outline-variant relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">SOLVED</p>
            <h3 className="font-headline-lg text-headline-lg font-bold">
              {metrics?.totalSolved ?? 0}
              <span className="text-on-surface-variant text-body-md font-normal">/{metrics?.totalAttempted ?? 0}</span>
            </h3>
            <div className="mt-md h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${metrics ? Math.min((metrics.totalSolved / Math.max(metrics.totalAttempted, 1)) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="p-lg bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="font-label-md text-label-md text-secondary mb-xs">EASY</p>
          <h3 className="font-headline-lg text-headline-lg font-bold">{metrics?.easySolved ?? 0}</h3>
          <p className="text-body-sm text-on-surface-variant mt-sm">Top 5% speed</p>
        </div>
        <div className="p-lg bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="font-label-md text-label-md text-tertiary mb-xs">MEDIUM</p>
          <h3 className="font-headline-lg text-headline-lg font-bold">{metrics?.mediumSolved ?? 0}</h3>
          <p className="text-body-sm text-on-surface-variant mt-sm">Consistency: High</p>
        </div>
        <div className="p-lg bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="font-label-md text-label-md text-error mb-xs">HARD</p>
          <h3 className="font-headline-lg text-headline-lg font-bold">{metrics?.hardSolved ?? 0}</h3>
          <p className="text-body-sm text-on-surface-variant mt-sm">Mastery: 2.1%</p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container p-4 rounded-xl border border-outline-variant">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-lg bg-surface-container-high border border-outline-variant py-2 pl-9 pr-4 text-on-surface text-sm placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="block w-full rounded-lg bg-surface-container-high border border-outline-variant py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="" className="bg-surface-container">All Difficulties</option>
            <option value="EASY" className="bg-surface-container">Easy</option>
            <option value="MEDIUM" className="bg-surface-container">Medium</option>
            <option value="HARD" className="bg-surface-container">Hard</option>
          </select>
        </div>

        <div>
          <select
            value={tag}
            onChange={(e) => { setTag(e.target.value); setPage(1); }}
            className="block w-full rounded-lg bg-surface-container-high border border-outline-variant py-2 px-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="" className="bg-surface-container">All Topics</option>
            {availableTags.map((t) => (
              <option key={t} value={t} className="bg-surface-container">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high/40 text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">Status</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6 w-32">Difficulty</th>
                <th className="py-4 px-6">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-on-surface-variant">
                    <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading problems...</p>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-on-surface-variant">
                    <HelpCircle className="h-8 w-8 mx-auto text-on-surface-variant/40 mb-2" />
                    <p className="font-medium text-on-surface">No problems found</p>
                    <p className="text-xs text-on-surface-variant mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-surface-variant/30 transition-colors group">
                    <td className="py-4 px-6 text-center">
                      <Circle className="h-4.5 w-4.5 mx-auto text-outline group-hover:text-primary transition-colors" />
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <Link to={`/problems/${problem.slug}`} className="hover:text-primary transition-colors">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags.length > 0 ? (
                          problem.tags.map((t) => (
                            <span key={t.id} className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-xs border border-outline-variant">
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-on-surface-variant/50 text-xs italic">No tags</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-outline-variant px-6 py-4 bg-surface-container-low/40">
            <span className="text-xs text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
