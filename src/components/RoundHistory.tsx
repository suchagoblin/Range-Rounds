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
      <div className="min-h-screen bg-topo p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading rounds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-topo p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Round History</h1>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-300 font-medium border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
        </div>

        {rounds.length === 0 ? (
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-12 text-center">
            <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No rounds yet</h2>
            <p className="text-slate-500">Start a new round to track your golf game!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => {
              const stats = calculateRoundStats(round);
              const scoreColor = stats.score === 0 ? 'text-white' : stats.score < 0 ? 'text-emerald-400' : 'text-red-400';
              const ScoreIcon = stats.score === 0 ? Target : stats.score < 0 ? TrendingDown : TrendingUp;

              return (
                <div
                  key={round.id}
                  onClick={() => handleLoadRound(round.id)}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-400">{formatDate(round.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                          <div className="text-sm text-slate-400">Holes</div>
                          <div className="text-xl font-bold text-emerald-400">
                            {stats.completedHoles}/{round.hole_count}
                          </div>
                        </div>

                        <div className="bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
                          <div className="text-sm text-slate-400">Strokes</div>
                          <div className="text-xl font-bold text-blue-400">{stats.totalStrokes}</div>
                        </div>

                        <div className="bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                          <div className="text-sm text-slate-400">Score</div>
                          <div className={`text-xl font-bold flex items-center gap-1 ${scoreColor}`}>
                            <ScoreIcon className="w-5 h-5" />
                            {stats.score > 0 ? '+' : ''}
                            {stats.score}
                          </div>
                        </div>
                      </div>

                      {!round.is_round_complete && stats.completedHoles < round.hole_count && (
                        <div className="mt-3">
                          <span className="inline-block bg-amber-500/20 text-amber-400 text-sm px-3 py-1 rounded-full font-medium border border-amber-500/30">
                            In Progress
                          </span>
                        </div>
                      )}

                      {round.is_round_complete && (
                        <div className="mt-3">
                          <span className="inline-block bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                            Complete
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleDeleteRound(e, round.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
                        title="Delete round"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleLoadRound(round.id)}
                        className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all border border-emerald-400"
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
