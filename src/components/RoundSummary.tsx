import { useState } from 'react';
import { useGolf } from '../context/GolfContext';
import { Trophy, Target, Share2, X, TrendingUp } from 'lucide-react';
import { ClubName, Direction } from '../types/golf';

interface RoundSummaryProps {
  onClose: () => void;
  onNewRound: () => void;
}

interface ShotDispersion {
  club: ClubName;
  directions: Record<Direction, number>;
  total: number;
  insight: string;
}

export default function RoundSummary({ onClose, onNewRound }: RoundSummaryProps) {
  const { round, getRoundStats, getHoleStats, profile } = useGolf();
  const [copied, setCopied] = useState(false);
  const stats = getRoundStats();

  if (!round || !round.isRoundComplete) return null;

  const analyzeShotDispersion = (clubName: ClubName): ShotDispersion | null => {
    const shots = round.holes
      .flatMap(hole => hole.shots)
      .filter(shot => shot.club === clubName && !shot.wasMulligan);

    if (shots.length === 0) return null;

    const directions: Record<Direction, number> = {
      'Wide Left': 0,
      'Left': 0,
      'Middle': 0,
      'Right': 0,
      'Wide Right': 0,
    };

    shots.forEach(shot => {
      directions[shot.inputDirection]++;
    });

    const maxDirection = Object.entries(directions)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])[0];

    const percentage = maxDirection ? Math.round((maxDirection[1] / shots.length) * 100) : 0;

    let insight = '';
    if (maxDirection && maxDirection[0] !== 'Middle' && percentage >= 40) {
      insight = `You missed ${maxDirection[0]} on ${percentage}% of your ${clubName} shots.`;
    } else if (directions['Middle'] >= shots.length * 0.6) {
      insight = `Great accuracy! ${Math.round((directions['Middle'] / shots.length) * 100)}% of shots went straight.`;
    } else {
      const leftTotal = directions['Wide Left'] + directions['Left'];
      const rightTotal = directions['Wide Right'] + directions['Right'];
      if (leftTotal > rightTotal) {
        insight = `Tendency to miss left (${Math.round((leftTotal / shots.length) * 100)}% of shots).`;
      } else if (rightTotal > leftTotal) {
        insight = `Tendency to miss right (${Math.round((rightTotal / shots.length) * 100)}% of shots).`;
      } else {
        insight = 'Your shots are well-distributed.';
      }
    }

    return {
      club: clubName,
      directions,
      total: shots.length,
      insight,
    };
  };

  const driverDispersion = analyzeShotDispersion('Driver');
  const woodDispersion = analyzeShotDispersion('3 Wood');
  const ironDispersion = analyzeShotDispersion('7 Iron');

  const eagles = round.holes.filter((_, idx) => getHoleStats(idx).score === -2).length;
  const birdies = round.holes.filter((_, idx) => getHoleStats(idx).score === -1).length;
  const pars = round.holes.filter((_, idx) => getHoleStats(idx).score === 0).length;
  const bogeys = round.holes.filter((_, idx) => getHoleStats(idx).score === 1).length;
  const doubles = round.holes.filter((_, idx) => getHoleStats(idx).score >= 2).length;

  const bestHole = round.holes
    .map((hole, idx) => ({ hole, stats: getHoleStats(idx) }))
    .filter(h => h.hole.isComplete)
    .sort((a, b) => a.stats.score - b.stats.score)[0];

  const handleShare = () => {
    const text = `I just shot ${stats.totalStrokes} (${stats.score > 0 ? '+' : ''}${stats.score}) in a ${round.holes.length}-hole round! ⛳️`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 to-emerald-800 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white px-8 py-10 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <Trophy className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
            <h1 className="text-4xl font-bold mb-2">Round Complete!</h1>
            <p className="text-green-100 text-lg">{profile?.name || 'Great round!'}</p>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-green-900 mb-2">
                  {stats.totalStrokes}
                </div>
                <div className="text-2xl font-semibold text-gray-700">Total Strokes</div>
              </div>
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className={`text-3xl font-bold ${stats.score === 0 ? 'text-gray-700' : stats.score < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.score > 0 ? '+' : ''}{stats.score}
                  </div>
                  <div className="text-sm text-gray-600">vs Par</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800">{round.holes.length}</div>
                  <div className="text-sm text-gray-600">Holes</div>
                </div>
                {round.mulligansUsed > 0 && (
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{round.mulligansUsed}</div>
                    <div className="text-sm text-gray-600">Mulligans</div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Score Distribution</h3>
                <div className="space-y-2">
                  {eagles > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Eagles</span>
                      <span className="text-lg font-bold text-yellow-600">{eagles}</span>
                    </div>
                  )}
                  {birdies > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Birdies</span>
                      <span className="text-lg font-bold text-green-600">{birdies}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Pars</span>
                    <span className="text-lg font-bold text-gray-700">{pars}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Bogeys</span>
                    <span className="text-lg font-bold text-amber-600">{bogeys}</span>
                  </div>
                  {doubles > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Double+</span>
                      <span className="text-lg font-bold text-red-600">{doubles}</span>
                    </div>
                  )}
                </div>
              </div>

              {bestHole && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    Best Hole
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-700 mb-1">
                      Hole {bestHole.hole.number}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      {bestHole.stats.scoreName}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {bestHole.stats.strokes} strokes on Par {bestHole.hole.par}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(driverDispersion || woodDispersion || ironDispersion) && (
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Shot Dispersion Analysis
                </h3>

                <div className="space-y-6">
                  {driverDispersion && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800">{driverDispersion.club}</span>
                        <span className="text-sm text-gray-600">{driverDispersion.total} shots</span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {(['Wide Left', 'Left', 'Middle', 'Right', 'Wide Right'] as Direction[]).map((direction) => {
                          const count = driverDispersion.directions[direction];
                          const percentage = driverDispersion.total > 0 ? (count / driverDispersion.total) * 100 : 0;

                          const colorClass = direction === 'Middle'
                            ? 'bg-green-500'
                            : direction.includes('Wide')
                            ? 'bg-red-500'
                            : 'bg-amber-500';

                          return count > 0 ? (
                            <div key={direction}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{direction}</span>
                                <span className="text-gray-600 font-medium">{count} ({Math.round(percentage)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`${colorClass} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {driverDispersion.insight}
                        </p>
                      </div>
                    </div>
                  )}

                  {woodDispersion && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800">{woodDispersion.club}</span>
                        <span className="text-sm text-gray-600">{woodDispersion.total} shots</span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {(['Wide Left', 'Left', 'Middle', 'Right', 'Wide Right'] as Direction[]).map((direction) => {
                          const count = woodDispersion.directions[direction];
                          const percentage = woodDispersion.total > 0 ? (count / woodDispersion.total) * 100 : 0;

                          const colorClass = direction === 'Middle'
                            ? 'bg-green-500'
                            : direction.includes('Wide')
                            ? 'bg-red-500'
                            : 'bg-amber-500';

                          return count > 0 ? (
                            <div key={direction}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{direction}</span>
                                <span className="text-gray-600 font-medium">{count} ({Math.round(percentage)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`${colorClass} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {woodDispersion.insight}
                        </p>
                      </div>
                    </div>
                  )}

                  {ironDispersion && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800">{ironDispersion.club}</span>
                        <span className="text-sm text-gray-600">{ironDispersion.total} shots</span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {(['Wide Left', 'Left', 'Middle', 'Right', 'Wide Right'] as Direction[]).map((direction) => {
                          const count = ironDispersion.directions[direction];
                          const percentage = ironDispersion.total > 0 ? (count / ironDispersion.total) * 100 : 0;

                          const colorClass = direction === 'Middle'
                            ? 'bg-green-500'
                            : direction.includes('Wide')
                            ? 'bg-red-500'
                            : 'bg-amber-500';

                          return count > 0 ? (
                            <div key={direction}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{direction}</span>
                                <span className="text-gray-600 font-medium">{count} ({Math.round(percentage)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`${colorClass} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {ironDispersion.insight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleShare}
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                {copied ? 'Copied!' : 'Share Round'}
              </button>
            </div>

            <button
              onClick={onNewRound}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Start New Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
