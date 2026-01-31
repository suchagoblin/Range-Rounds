import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { Trophy, Target, TrendingUp, TrendingDown, Users, X, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  profileName: string;
  totalStrokes: number;
  totalPar: number;
  score: number;
  completedHoles: number;
  isComplete: boolean;
}

interface CourseLeaderboardProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
}

export default function CourseLeaderboard({ courseId, courseName, onClose }: CourseLeaderboardProps) {
  const { getCourseLeaderboard } = useGolf();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();

    const channel = supabase
      .channel('leaderboard_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holes',
        },
        () => {
          loadLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shots',
        },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getCourseLeaderboard(courseId);
    setLeaderboard(data as LeaderboardEntry[]);
    setLoading(false);
  };

  const getPositionStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-500/30';
    if (index === 1) return 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30';
    if (index === 2) return 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-600/30';
    return 'bg-slate-700/50 border-slate-600';
  };

  const getPositionBadgeStyle = (index: number) => {
    if (index === 0) return 'bg-amber-400 text-amber-900';
    if (index === 1) return 'bg-slate-400 text-slate-900';
    if (index === 2) return 'bg-amber-600 text-white';
    return 'bg-slate-600 text-slate-300';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full my-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-6 py-6 rounded-t-2xl border-b border-emerald-500">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Leaderboard</h1>
                <p className="text-emerald-100 text-sm">{courseName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-emerald-100">
              <Users className="w-4 h-4" />
              <span>{leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'} competing</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/10">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs font-semibold">LIVE</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-300 mb-2">No players yet</h2>
              <p className="text-slate-500">Be the first to play this course!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const scoreColor = entry.score === 0 ? 'text-white' : entry.score < 0 ? 'text-emerald-400' : 'text-red-400';
                const ScoreIcon = entry.score === 0 ? Target : entry.score < 0 ? TrendingDown : TrendingUp;

                return (
                  <div
                    key={index}
                    className={`${getPositionStyle(index)} rounded-xl border p-4 transition-all hover:bg-slate-700/70`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${getPositionBadgeStyle(index)} w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg`}>
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">
                            {entry.profileName}
                          </h3>
                          {entry.isComplete && (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-500/30">
                              Complete
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div>
                            <span className="font-semibold text-slate-300">{entry.completedHoles}</span> holes
                          </div>
                          <div>
                            <span className="font-semibold text-slate-300">{entry.totalStrokes}</span> strokes
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-bold flex items-center gap-1 ${scoreColor}`}>
                          <ScoreIcon className="w-6 h-6" />
                          {entry.score > 0 ? '+' : ''}
                          {entry.score}
                        </div>
                        <div className="text-xs text-slate-500">
                          vs Par
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-400 mb-1">Live Competition</h4>
                <p className="text-sm text-blue-300/80">
                  Rankings update automatically. Play your round and see where you stand against your friends!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
