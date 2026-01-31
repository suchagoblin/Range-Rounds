import { useState } from 'react';
import { useGolf } from '../context/GolfContext';
import { Wind, Target, Droplet, TrendingUp, Undo2, User, SkipForward, RotateCcw } from 'lucide-react';
import ShotInput from './ShotInput';
import Scorecard from './Scorecard';
import HoleOverview from './HoleOverview';
import ActiveParticipants from './ActiveParticipants';

interface GameScreenProps {
  onOpenProfile: () => void;
}

export default function GameScreen({ onOpenProfile }: GameScreenProps) {
  const { getCurrentHole, undoLastShot, useMulligan, skipHole, getRoundStats, round, currentCourseId } = useGolf();
  const [showScorecard, setShowScorecard] = useState(false);

  const currentHole = getCurrentHole();
  const stats = getRoundStats();

  if (!currentHole) return null;

  if (showScorecard) {
    return <Scorecard onClose={() => setShowScorecard(false)} />;
  }

  const currentDistance = currentHole.shots.length === 0
    ? currentHole.yardage
    : currentHole.shots[currentHole.shots.length - 1].remainingDistance;

  const lastShot = currentHole.shots.length > 0 ? currentHole.shots[currentHole.shots.length - 1] : null;
  const hasDistancePenalty = lastShot && lastShot.distancePenalty > 0;

  const totalShots = currentHole.shots.reduce((sum, shot) => sum + 1 + shot.penaltyStrokes, 0);

  return (
    <div className="min-h-screen bg-topo">
      {currentCourseId && <ActiveParticipants courseId={currentCourseId} />}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hole {currentHole.number}</h1>
              <div className="flex gap-3 mt-1">
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Par {currentHole.par}</span>
                <span className="text-sm text-gray-600">{currentHole.yardage} yards</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onOpenProfile}
                className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200"
                title="Manage Profile"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowScorecard(true)}
                className="px-4 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md text-sm font-semibold text-gray-900 transition-all border border-gray-200"
              >
                Scorecard
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Distance</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{currentDistance} yds</span>
                {hasDistancePenalty && lastShot && (
                  <div className="text-xs text-amber-600 font-semibold">
                    (+{lastShot.distancePenalty}y penalty)
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Shots</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{totalShots}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Wind className="w-4 h-4 text-sky-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Wind</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {currentHole.windSpeed} mph {currentHole.windDir}
              </span>
            </div>

            {currentHole.hazard && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Hazard</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">{currentHole.hazard}</span>
              </div>
            )}
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="text-center mb-3">
              <span className="text-sm font-medium text-gray-500">Round Score</span>
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalStrokes}</div>
                <div className="text-xs text-gray-500 mt-0.5">Strokes</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stats.score === 0 ? 'text-gray-900' : stats.score < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.score > 0 ? '+' : ''}{stats.score}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">vs Par</div>
              </div>
              {round && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {round.mulligansAllowed - round.mulligansUsed}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Mulligans</div>
                </div>
              )}
            </div>
          </div>

          <HoleOverview hole={currentHole} currentDistance={currentDistance} />
        </div>

        <ShotInput currentDistance={currentDistance} />

        <div className="flex gap-3 mt-4">
          {currentHole.shots.length > 0 && !currentHole.isComplete && (
            <>
              <button
                onClick={undoLastShot}
                className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Undo2 className="w-5 h-5" />
                Undo
              </button>
              {round && round.mulligansUsed < round.mulligansAllowed && (
                <button
                  onClick={useMulligan}
                  className="flex-1 py-3 bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-600 rounded-2xl font-semibold text-white hover:shadow-md transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-5 h-5" />
                  Mulligan
                </button>
              )}
            </>
          )}
          {!currentHole.isComplete && (
            <button
              onClick={skipHole}
              className="flex-1 py-3 bg-white border-2 border-amber-200 rounded-2xl font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <SkipForward className="w-5 h-5" />
              Skip Hole
            </button>
          )}
        </div>

        {currentHole.shots.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Shot History</h3>
            <div className="space-y-3">
              {currentHole.shots.map((shot, idx) => (
                <div key={shot.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{shot.club}</div>
                      <div className="text-xs text-gray-500">{shot.inputDirection}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{shot.inputDistance} yds</div>
                    {shot.distancePenalty > 0 && (
                      <div className="text-xs text-amber-600 font-semibold">
                        Plays like {shot.inputDistance + shot.distancePenalty}y
                      </div>
                    )}
                    {shot.penaltyStrokes > 0 && (
                      <span className="text-xs text-red-600 font-semibold">+{shot.penaltyStrokes} penalty stroke</span>
                    )}
                    {shot.hitHazard && (
                      <span className="text-xs text-blue-600 font-semibold block">Hit hazard</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
