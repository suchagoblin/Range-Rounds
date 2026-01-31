import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { CommunityLeaderboardEntry } from '../types/golf';
import { Trophy, Medal, Award, Users, ArrowLeft, RefreshCw } from 'lucide-react';

interface CommunityLeaderboardProps {
  onClose: () => void;
}

export default function CommunityLeaderboard({ onClose }: CommunityLeaderboardProps) {
  const { getCommunityLeaderboard, profile } = useGolf();
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getCommunityLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400" aria-label="First place" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" aria-label="Second place" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" aria-label="Third place" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-600/30 to-slate-500/20 border-slate-500/30';
      case 3:
        return 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-600/30';
      default:
        return 'bg-slate-800/50 border-slate-700';
    }
  };

  const formatScore = (score: number, holes: number) => {
    if (score === 0) return 'E';
    const sign = score > 0 ? '+' : '';
    return `${sign}${score} (${holes}h)`;
  };

  return (
    <main className="min-h-screen bg-topo" aria-label="Community Leaderboard">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" aria-hidden="true" />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            Community
          </h1>
          <button
            onClick={loadLeaderboard}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-700 disabled:opacity-50"
            aria-label="Refresh leaderboard"
          >
            <RefreshCw className={`w-5 h-5 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 border-b border-emerald-500">
            <h2 className="text-lg font-bold text-white">Top Players</h2>
            <p className="text-emerald-100 text-sm">Ranked by best score per hole</p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No completed rounds yet</p>
              <p className="text-slate-500 text-sm mt-1">Be the first to complete a round!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {leaderboard.map((entry) => {
                const isCurrentUser = profile?.id === entry.profileId;
                return (
                  <div
                    key={entry.profileId}
                    className={`px-5 py-4 flex items-center gap-4 border ${getRankStyle(entry.rank)} ${
                      isCurrentUser ? 'ring-2 ring-emerald-500 ring-inset' : ''
                    }`}
                    aria-label={`Rank ${entry.rank}: ${entry.profileName}`}
                  >
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold truncate ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                          {entry.profileName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 flex gap-3 mt-0.5">
                        <span>{entry.roundsPlayed} round{entry.roundsPlayed !== 1 ? 's' : ''}</span>
                        <span>Avg: {entry.averageScore > 0 ? '+' : ''}{entry.averageScore}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-bold ${
                        entry.bestScore < 0 ? 'text-emerald-400' :
                        entry.bestScore === 0 ? 'text-white' : 'text-red-400'
                      }`}>
                        {formatScore(entry.bestScore, entry.bestScoreHoles)}
                      </div>
                      <div className="text-xs text-slate-500">Best</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          <p>Rankings based on best score relative to par</p>
        </div>
      </div>
    </main>
  );
}
