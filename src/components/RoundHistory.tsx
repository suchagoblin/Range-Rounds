import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { History, Calendar, Target, TrendingUp, TrendingDown, ArrowLeft, Trash2 } from 'lucide-react';

interface RoundSummary {
  id: string;
  hole_count: number;
  is_round_complete: boolean;
  created_at: string;
  holes: Array<{
    par: number;
    putts: number;
    is_complete: boolean;
    shots: Array<{
      penalty_strokes: number;
    }>;
  }>;
}

interface RoundHistoryProps {
  onBack?: () => void;
}

export default function RoundHistory({ onBack }: RoundHistoryProps) {
  const { getPastRounds, loadRound, deleteRound } = useGolf();
  const [rounds, setRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    setLoading(true);
    const data = await getPastRounds();
    setRounds(data as RoundSummary[]);
    setLoading(false);
  };

  const calculateRoundStats = (round: RoundSummary) => {
    let totalStrokes = 0;
    let totalPar = 0;
    let completedHoles = 0;

    round.holes.forEach((hole) => {
      if (hole.is_complete) {
        const shotStrokes = hole.shots.reduce((sum, shot) => sum + 1 + shot.penalty_strokes, 0);
        totalStrokes += shotStrokes + hole.putts;
        totalPar += hole.par;
        completedHoles++;
      }
    });

    return {
      totalStrokes,
      totalPar,
      score: totalStrokes - totalPar,
      completedHoles,
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleLoadRound = async (roundId: string) => {
    await loadRound(roundId);
    if (onBack) onBack();
  };

  const handleDeleteRound = async (e: React.MouseEvent, roundId: string) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      await deleteRound(roundId);
      await loadRounds();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rounds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Round History</h1>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all text-gray-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
        </div>

        {rounds.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No rounds yet</h2>
            <p className="text-gray-500">Start a new round to track your golf game!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => {
              const stats = calculateRoundStats(round);
              const scoreColor = stats.score === 0 ? 'text-gray-700' : stats.score < 0 ? 'text-green-600' : 'text-red-600';
              const ScoreIcon = stats.score === 0 ? Target : stats.score < 0 ? TrendingDown : TrendingUp;

              return (
                <div
                  key={round.id}
                  onClick={() => handleLoadRound(round.id)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-2 border-transparent hover:border-green-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{formatDate(round.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="bg-green-50 px-4 py-2 rounded-lg">
                          <div className="text-sm text-gray-600">Holes</div>
                          <div className="text-xl font-bold text-green-700">
                            {stats.completedHoles}/{round.hole_count}
                          </div>
                        </div>

                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                          <div className="text-sm text-gray-600">Strokes</div>
                          <div className="text-xl font-bold text-blue-700">{stats.totalStrokes}</div>
                        </div>

                        <div className="bg-gray-50 px-4 py-2 rounded-lg">
                          <div className="text-sm text-gray-600">Score</div>
                          <div className={`text-xl font-bold flex items-center gap-1 ${scoreColor}`}>
                            <ScoreIcon className="w-5 h-5" />
                            {stats.score > 0 ? '+' : ''}
                            {stats.score}
                          </div>
                        </div>
                      </div>

                      {!round.is_round_complete && stats.completedHoles < round.hole_count && (
                        <div className="mt-3">
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                            In Progress
                          </span>
                        </div>
                      )}

                      {round.is_round_complete && (
                        <div className="mt-3">
                          <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                            Complete
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDeleteRound(e, round.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete round"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleLoadRound(round.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
