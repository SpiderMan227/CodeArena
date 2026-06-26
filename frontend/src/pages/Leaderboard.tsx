import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Flame, Search, ShieldAlert } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  solvedCount: number;
  attemptedCount: number;
  currentStreak: number;
  acceptanceRate: number;
  user: {
    username: string;
    email: string;
  };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/users/leaderboard');
        setLeaderboard(response.data.leaderboard);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load leaderboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Trophy className="h-3.5 w-3.5" /> 1st
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-300/10 text-slate-300 border border-slate-300/20">
            <Trophy className="h-3.5 w-3.5" /> 2nd
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-600/10 text-amber-600 border border-amber-600/20">
            <Trophy className="h-3.5 w-3.5" /> 3rd
          </span>
        );
      default:
        return <span className="text-slate-400 font-mono">{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0a0a0c]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center space-y-4">
        <ShieldAlert className="h-10 w-10 mx-auto" />
        <h3 className="text-lg font-bold">Error Loading Leaderboard</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#121216] to-[#181824] border border-[#1f1f2e] text-center space-y-2.5 shadow-2xl relative overflow-hidden">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 mb-4 border border-yellow-500/20">
          <Trophy className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Global Leaderboard</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Compete with developers worldwide. Rank is calculated based on problems solved, followed by active streak consistency.
        </p>
      </div>

      {/* Control Actions / Search bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#121216]/60 border border-[#1f1f2e] p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search coders by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-2.5 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-[#1f1f2e] bg-[#121216]/80 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f2e] bg-[#161622]/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6 text-center w-24">Rank</th>
              <th className="py-4 px-6">Coder</th>
              <th className="py-4 px-6 text-center w-40">Problems Solved</th>
              <th className="py-4 px-6 text-center w-40">Acceptance Rate</th>
              <th className="py-4 px-6 text-center w-40">Current Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f2e] text-sm text-slate-300">
            {filteredLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 italic">
                  No coders found matching your search.
                </td>
              </tr>
            ) : (
              filteredLeaderboard.map((entry, idx) => (
                <tr key={entry.userId} className="hover:bg-[#1f1f2e]/10 transition-colors">
                  <td className="py-4 px-6 text-center font-bold">
                    {getRankBadge(idx + 1)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-white">{entry.user.username}</span>
                  </td>
                  <td className="py-4 px-6 text-center font-semibold font-mono text-indigo-400 text-lg">
                    {entry.solvedCount}
                  </td>
                  <td className="py-4 px-6 text-center font-semibold font-mono text-purple-400 text-base">
                    {entry.acceptanceRate}%
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-500 font-mono">
                      <Flame className="h-4 w-4 shrink-0" /> {entry.currentStreak} days
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
