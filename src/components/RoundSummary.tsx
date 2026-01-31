import { useState } from 'react';
import { useGolf } from '../context/GolfContext';
import { Trophy, Target, Share2, X } from 'lucide-react';

interface RoundSummaryProps {
  onClose: () => void;
  onNewRound: () => void;
}

export default function RoundSummary({ onClose, onNewRound }: RoundSummaryProps) {
  const { round, getRoundStats, getHoleStats, profile } = useGolf();
  const [copied, setCopied] = useState(false);
  const stats = getRoundStats();

  if (!round || !round.isRoundComplete) return null;

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
