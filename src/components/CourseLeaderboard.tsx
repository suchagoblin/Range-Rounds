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

  const getPositionColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-br from-orange-400 to-orange-500';
    return 'bg-gray-100';
  };

  const getPositionTextColor = (index: number) => {
    if (index <= 2) return 'text-white';
    return 'text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white px-6 py-6 rounded-t-2xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Leaderboard</h1>
                <p className="text-green-100 text-sm">{courseName}</p>
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
            <div className="flex items-center gap-2 text-sm text-green-100">
              <Users className="w-4 h-4" />
              <span>{leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'} competing</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs font-semibold">LIVE</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No players yet</h2>
              <p className="text-gray-500">Be the first to play this course!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const scoreColor = entry.score === 0 ? 'text-gray-700' : entry.score < 0 ? 'text-green-600' : 'text-red-600';
                const ScoreIcon = entry.score === 0 ? Target : entry.score < 0 ? TrendingDown : TrendingUp;

                return (
                  <div
                    key={index}
                    className={`${getPositionColor(index)} rounded-xl shadow-md p-4 transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${getPositionTextColor(index)} text-2xl font-bold w-8 text-center`}>
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-bold ${getPositionTextColor(index)}`}>
                            {entry.profileName}
                          </h3>
                          {entry.isComplete && (
                            <span className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                              Complete
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className={getPositionTextColor(index)}>
                            <span className="font-semibold">{entry.completedHoles}</span> holes
                          </div>
                          <div className={getPositionTextColor(index)}>
                            <span className="font-semibold">{entry.totalStrokes}</span> strokes
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-3xl font-bold flex items-center gap-1 ${index <= 2 ? 'text-white' : scoreColor}`}>
                          <ScoreIcon className="w-6 h-6" />
                          {entry.score > 0 ? '+' : ''}
                          {entry.score}
                        </div>
                        <div className={`text-xs ${getPositionTextColor(index)} opacity-75`}>
                          vs Par
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Live Competition</h4>
                <p className="text-sm text-blue-700">
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
