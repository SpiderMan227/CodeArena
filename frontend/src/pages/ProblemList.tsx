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

  // Unique tags for filtering options
  const availableTags = ['Arrays', 'Strings', 'Dynamic Programming', 'Greedy', 'Math', 'Trees', 'Graphs'];

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
    <div className="space-y-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />

      <div>
        <h2 className="text-2xl font-extrabold text-white">Problems</h2>
        <p className="text-sm text-slate-400 mt-1">Choose a task, refine your algorithms, and test against robust cases.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#121216]/60 backdrop-blur-md p-4 rounded-xl border border-[#1f1f2e]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full rounded-lg bg-[#0c0c0f] border border-[#1f1f2e] py-2 pl-9 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="block w-full rounded-lg bg-[#0c0c0f] border border-[#1f1f2e] py-2 px-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <select
            value={tag}
            onChange={(e) => { setTag(e.target.value); setPage(1); }}
            className="block w-full rounded-lg bg-[#0c0c0f] border border-[#1f1f2e] py-2 px-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">All Topics</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-[#121216]/80 border border-[#1f1f2e] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1f1f2e] bg-[#161622]/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">Status</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6 w-32">Difficulty</th>
                <th className="py-4 px-6">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f2e] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading problems...</p>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <HelpCircle className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-slate-300">No problems found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-[#1f1f2e]/20 transition-colors group">
                    <td className="py-4 px-6 text-center">
                      {/* Solved logic placeholder for now */}
                      <Circle className="h-4.5 w-4.5 mx-auto text-slate-600 group-hover:text-slate-500 transition-colors" />
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <Link to={`/problems/${problem.slug}`} className="hover:text-indigo-400 transition-colors">
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
                            <span key={t.id} className="px-2 py-0.5 rounded bg-[#1f1f2e] text-slate-400 text-xs border border-[#2a2a3d]">
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 text-xs italic">No tags</span>
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
          <div className="flex items-center justify-between border-t border-[#1f1f2e] px-6 py-4 bg-[#161622]/20">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-[#1f1f2e] bg-[#0c0c0f] text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-[#1f1f2e] bg-[#0c0c0f] text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
