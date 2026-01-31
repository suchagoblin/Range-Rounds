import { useState } from 'react';
import { useGolf } from '../context/GolfContext';
import { Wind, Target, Droplet, TrendingUp, Undo2, User, SkipForward, RotateCcw, X, XCircle, Save } from 'lucide-react';
import ShotInput from './ShotInput';
import Scorecard from './Scorecard';
import HoleOverview from './HoleOverview';
import ActiveParticipants from './ActiveParticipants';
import { showToast } from '../utils/toast';

interface GameScreenProps {
  onOpenProfile: () => void;
}

export default function GameScreen({ onOpenProfile }: GameScreenProps) {
  const { getCurrentHole, undoLastShot, useMulligan, skipHole, getRoundStats, round, currentCourseId, exitRound, deleteRound, currentRoundId } = useGolf();
  const [showScorecard, setShowScorecard] = useState(false);
  const [showEndRoundDialog, setShowEndRoundDialog] = useState(false);

  const currentHole = getCurrentHole();
  const stats = getRoundStats();

  if (!currentHole) return null;

  if (showScorecard) {
    return <Scorecard onClose={() => setShowScorecard(false)} />;
  }

  const handleDiscardRound = async () => {
    if (currentRoundId) {
      await deleteRound(currentRoundId);
      exitRound();
      showToast('Round discarded', 'success');
    }
  };

  const handleSaveRound = () => {
    exitRound();
    showToast('Round saved. You can resume it from your history.', 'success');
  };

  const currentDistance = currentHole.shots.length === 0
    ? currentHole.yardage
    : currentHole.shots[currentHole.shots.length - 1].remainingDistance;

  const lastShot = currentHole.shots.length > 0 ? currentHole.shots[currentHole.shots.length - 1] : null;
  const hasDistancePenalty = lastShot && lastShot.distancePenalty > 0;

  const totalShots = currentHole.shots.reduce((sum, shot) => sum + 1 + shot.penaltyStrokes, 0);

  return (
    <main className="min-h-screen bg-topo" aria-label="Golf game screen">
      {currentCourseId && <ActiveParticipants courseId={currentCourseId} />}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Hole {currentHole.number}</h1>
              <div className="flex gap-3 mt-1">
                <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">Par {currentHole.par}</span>
                <span className="text-sm text-slate-400">{currentHole.yardage} yards</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onOpenProfile}
                className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                aria-label="Manage Profile"
              >
                <User className="w-5 h-5 text-slate-300" aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowScorecard(true)}
                className="px-4 py-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 text-sm font-semibold text-white transition-all border border-slate-700"
                aria-label="View scorecard"
              >
                Scorecard
              </button>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Distance</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{currentDistance} yds</span>
                {hasDistancePenalty && lastShot && (
                  <div className="text-xs text-amber-400 font-semibold">
                    (+{lastShot.distancePenalty}y penalty)
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Shots</span>
              </div>
              <span className="text-xl font-bold text-white">{totalShots}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center border border-sky-500/30">
                  <Wind className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Wind</span>
              </div>
              <span className="text-sm font-semibold text-slate-300">
                {currentHole.windSpeed === 0 || currentHole.windDir === 'None' ? (
                  <span className="text-slate-500">Disabled</span>
                ) : (
                  `${currentHole.windSpeed} mph ${currentHole.windDir}`
                )}
              </span>
            </div>

            {currentHole.hazard && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <Droplet className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">Hazard</span>
                </div>
                <span className="text-sm font-semibold text-blue-400">{currentHole.hazard}</span>
              </div>
            )}
          </div>

          <div className="mt-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5">
            <div className="text-center mb-3">
              <span className="text-sm font-medium text-slate-500">Round Score</span>
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalStrokes}</div>
                <div className="text-xs text-slate-500 mt-0.5">Strokes</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stats.score === 0 ? 'text-white' : stats.score < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.score > 0 ? '+' : ''}{stats.score}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">vs Par</div>
              </div>
              {round && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {round.mulligansAllowed - round.mulligansUsed}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Mulligans</div>
                </div>
              )}
            </div>
          </div>

          <HoleOverview hole={currentHole} currentDistance={currentDistance} />
        </div>

        <ShotInput currentDistance={currentDistance} />

        <div className="flex gap-3 mt-4" role="group" aria-label="Shot actions">
          {currentHole.shots.length > 0 && !currentHole.isComplete && (
            <>
              <button
                onClick={undoLastShot}
                aria-label="Undo last shot"
                className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-2xl font-semibold text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <Undo2 className="w-5 h-5" aria-hidden="true" />
                Undo
              </button>
              {round && round.mulligansUsed < round.mulligansAllowed && (
                <button
                  onClick={useMulligan}
                  aria-label={`Use mulligan, ${round.mulligansAllowed - round.mulligansUsed} remaining`}
                  className="flex-1 py-3 bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400 rounded-2xl font-semibold text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 glow-blue"
                >
                  <RotateCcw className="w-5 h-5" aria-hidden="true" />
                  Mulligan
                </button>
              )}
            </>
          )}
          {!currentHole.isComplete && (
            <button
              onClick={skipHole}
              aria-label="Skip current hole"
              className="flex-1 py-3 bg-slate-800 border border-amber-500/30 rounded-2xl font-semibold text-amber-400 hover:bg-slate-700 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
            >
              <SkipForward className="w-5 h-5" aria-hidden="true" />
              Skip Hole
            </button>
          )}
        </div>

        {currentHole.shots.length > 0 && (
          <div className="mt-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-4">Shot History</h3>
            <div className="space-y-3">
              {currentHole.shots.map((shot, idx) => (
                <div key={shot.id} className="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{shot.club}</div>
                      <div className="text-xs text-slate-500">{shot.inputDirection}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{shot.inputDistance} yds</div>
                    {shot.distancePenalty > 0 && (
                      <div className="text-xs text-amber-400 font-semibold">
                        Plays like {shot.inputDistance + shot.distancePenalty}y
                      </div>
                    )}
                    {shot.penaltyStrokes > 0 && (
                      <span className="text-xs text-red-400 font-semibold">+{shot.penaltyStrokes} penalty stroke</span>
                    )}
                    {shot.hitHazard && (
                      <span className="text-xs text-blue-400 font-semibold block">Hit hazard</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowEndRoundDialog(true)}
          className="mt-6 w-full py-3 bg-slate-800 border border-red-500/30 rounded-2xl font-semibold text-red-400 hover:bg-slate-700 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          End Round
        </button>
      </div>

      {showEndRoundDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">End Round</h2>
              <button
                onClick={() => setShowEndRoundDialog(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-400 mb-6">
              Would you like to save this round or discard it?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSaveRound}
                className="w-full py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-emerald-400 glow-green"
              >
                <Save className="w-5 h-5" />
                Save Round
              </button>
              <p className="text-xs text-slate-500 text-center -mt-2 mb-4">
                Resume this round later from your history
              </p>

              <button
                onClick={handleDiscardRound}
                className="w-full py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-red-400"
              >
                <XCircle className="w-5 h-5" />
                Discard Round
              </button>
              <p className="text-xs text-slate-500 text-center -mt-2">
                Permanently delete this round
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
