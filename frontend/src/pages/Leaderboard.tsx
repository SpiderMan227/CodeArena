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
    avatarUrl?: string | null;
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

  const showPodium = leaderboard.length >= 3 && searchQuery === '';
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  const listItems = showPodium ? filteredLeaderboard.slice(3) : filteredLeaderboard;
  const rankOffset = showPodium ? 4 : 1;

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
    <div className="space-y-6 max-w-4xl mx-auto pb-12 relative animate-fadeIn">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-low border border-outline-variant text-center space-y-2.5 shadow-2xl relative overflow-hidden">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 mb-4 border border-yellow-500/20">
          <Trophy className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Global Leaderboard</h2>
        <p className="text-on-surface-variant text-sm max-w-lg mx-auto">
          Compete with developers worldwide. Rank is calculated based on problems solved, followed by active streak consistency.
        </p>
      </div>

      {showPodium && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-2xl pt-8">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 flex flex-col items-center justify-end">
            <div className="w-full max-w-[280px] bg-gradient-to-b from-[#4edea3]/10 to-transparent rounded-t-2xl p-lg flex flex-col items-center border-t border-x border-[#4edea3]/20 relative group hover:scale-[1.02] transition-transform animate-fadeIn">
              <div className="absolute -top-12 w-24 h-24 rounded-full p-1 bg-[#4edea3]">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface-container-lowest bg-surface-container-lowest flex items-center justify-center">
                  {second.user.avatarUrl ? (
                    <img className="w-full h-full object-cover" alt="Runner Up" src={second.user.avatarUrl} />
                  ) : null}
                </div>
              </div>
              <div className="mt-12 text-center">
                <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-widest mb-xs block">Runner Up</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">{second.user.username}</h3>
                <p className="font-code-md text-code-md text-on-surface-variant">Rank #2</p>
                <div className="mt-lg flex justify-between gap-xl bg-surface-container-highest/30 px-md py-sm rounded-lg">
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Solved</p>
                    <p className="font-headline-sm text-headline-sm font-bold">{second.solvedCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Streak</p>
                    <p className="font-headline-sm text-headline-sm font-bold">{second.currentStreak}d</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-24 mt-lg bg-surface-container-high rounded-lg flex items-center justify-center">
                <span className="font-headline-xl text-headline-xl text-secondary/30 font-black italic">#2</span>
              </div>
            </div>
          </div>
          {/* Rank 1 */}
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="w-full max-w-[320px] bg-gradient-to-b from-[#b4c5ff]/15 to-transparent rounded-t-2xl p-xl flex flex-col items-center border-t border-x border-[#b4c5ff]/40 relative group z-20 hover:scale-[1.03] transition-transform animate-fadeIn">
              <div className="absolute -top-16 w-32 h-32 rounded-full p-1 bg-[#b4c5ff]">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface-container-lowest bg-surface-container-lowest flex items-center justify-center">
                  {first.user.avatarUrl ? (
                    <img className="w-full h-full object-cover" alt="Grandmaster" src={first.user.avatarUrl} />
                  ) : null}
                </div>
                <div className="absolute -bottom-2 right-0 bg-[#b4c5ff] text-[#002a78] w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined scale-75" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
              <div className="mt-16 text-center">
                <span className="font-label-md text-label-md text-primary uppercase font-bold tracking-widest mb-xs block">Grandmaster</span>
                <h3 className="font-headline-lg text-headline-lg text-on-surface">{first.user.username}</h3>
                <p className="font-code-md text-code-md text-on-surface-variant">Rank #1</p>
                <div className="mt-xl flex justify-between gap-xl bg-primary-container/10 px-md py-sm rounded-lg border border-primary/20">
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Solved</p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary">{first.solvedCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Streak</p>
                    <p className="font-headline-sm text-headline-sm font-bold text-primary">{first.currentStreak}d</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-32 mt-lg bg-surface-container-high rounded-lg flex items-center justify-center shadow-xl">
                <span className="font-headline-xl text-headline-xl text-primary font-black italic">#1</span>
              </div>
            </div>
          </div>
          {/* Rank 3 */}
          <div className="order-3 flex flex-col items-center justify-end">
            <div className="w-full max-w-[280px] bg-gradient-to-b from-[#4edea3]/10 to-transparent rounded-t-2xl p-lg flex flex-col items-center border-t border-x border-[#4edea3]/10 relative group hover:scale-[1.02] transition-transform animate-fadeIn">
              <div className="absolute -top-12 w-24 h-24 rounded-full p-1 bg-surface-container-highest">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface-container-lowest bg-surface-container-lowest flex items-center justify-center">
                  {third.user.avatarUrl ? (
                    <img className="w-full h-full object-cover" alt="Bronze Tier" src={third.user.avatarUrl} />
                  ) : null}
                </div>
              </div>
              <div className="mt-12 text-center">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase font-bold tracking-widest mb-xs block">Bronze Tier</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">{third.user.username}</h3>
                <p className="font-code-md text-code-md text-on-surface-variant">Rank #3</p>
                <div className="mt-lg flex justify-between gap-xl bg-surface-container-highest/30 px-md py-sm rounded-lg">
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Solved</p>
                    <p className="font-headline-sm text-headline-sm font-bold">{third.solvedCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-label-md text-label-md text-on-surface-variant">Streak</p>
                    <p className="font-headline-sm text-headline-sm font-bold">{third.currentStreak}d</p>
                  </div>
                </div>
              </div>
              <div className="w-full h-20 mt-lg bg-surface-container-high rounded-lg flex items-center justify-center">
                <span className="font-headline-xl text-headline-xl text-on-surface-variant/20 font-black italic">#3</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Control Actions / Search bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-container border border-outline-variant p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search coders by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-outline-variant bg-surface-container-high py-2.5 pl-10 pr-4 text-on-surface placeholder-slate-500 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-high/40 text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6 text-center w-24">Rank</th>
              <th className="py-4 px-6">Coder</th>
              <th className="py-4 px-6 text-center w-40">Problems Solved</th>
              <th className="py-4 px-6 text-center w-40">Acceptance Rate</th>
              <th className="py-4 px-6 text-center w-40">Current Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-sm text-on-surface-variant">
            {listItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant italic">
                  No coders found matching your search.
                </td>
              </tr>
            ) : (
              listItems.map((entry, idx) => (
                <tr key={entry.userId} className="hover:bg-surface-variant/30 transition-colors">
                  <td className="py-4 px-6 text-center font-bold">
                    {getRankBadge(idx + rankOffset)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-white">{entry.user.username}</span>
                  </td>
                  <td className="py-4 px-6 text-center font-semibold font-mono text-primary text-lg">
                    {entry.solvedCount}
                  </td>
                  <td className="py-4 px-6 text-center font-semibold font-mono text-secondary text-base">
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
