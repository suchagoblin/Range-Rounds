import { useState } from 'react';
import { useGolf } from '../context/GolfContext';
import { X, Trophy, ChevronDown, Droplet, Mountain, Save } from 'lucide-react';

interface ScorecardProps {
  onClose: () => void;
}

export default function Scorecard({ onClose }: ScorecardProps) {
  const { round, getHoleStats, getRoundStats, saveCurrentCourse } = useGolf();
  const [expandedHole, setExpandedHole] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  if (!round) return null;

  const roundStats = getRoundStats();

  const toggleHole = (holeNumber: number) => {
    setExpandedHole(expandedHole === holeNumber ? null : holeNumber);
  };

  const handleSaveCourse = async () => {
    if (!courseName.trim()) {
      alert('Please enter a course name');
      return;
    }

    const courseId = await saveCurrentCourse(courseName, courseDescription || undefined);
    if (courseId) {
      alert('Course saved successfully!');
      setShowSaveDialog(false);
      setCourseName('');
      setCourseDescription('');
    } else {
      alert('Failed to save course. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-4 py-6 sticky top-0 z-10 border-b border-emerald-500">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Scorecard</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
              <div className="text-2xl font-bold">{roundStats.totalStrokes}</div>
              <div className="text-xs text-emerald-100">Total Strokes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
              <div className={`text-2xl font-bold ${roundStats.score === 0 ? '' : roundStats.score < 0 ? 'text-green-200' : 'text-red-200'}`}>
                {roundStats.score > 0 ? '+' : ''}{roundStats.score}
              </div>
              <div className="text-xs text-emerald-100">vs Par</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
              <div className="text-2xl font-bold">{roundStats.completedHoles}</div>
              <div className="text-xs text-emerald-100">Holes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full mb-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-blue-400 glow-blue"
        >
          <Save className="w-5 h-5" />
          Save Course Layout
        </button>

        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Save Course</h2>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400 mb-4">Save this course layout to replay it later or share with friends!</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g., Windy Challenge"
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="What makes this course unique?"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveCourse}
                  className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all border border-emerald-400 glow-green"
                >
                  Save Course
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="bg-slate-700 px-4 py-3 grid grid-cols-4 gap-2 text-xs font-semibold text-slate-300">
            <div className="text-left">Hole</div>
            <div className="text-center">Par</div>
            <div className="text-center">Score</div>
            <div className="text-center">Result</div>
          </div>

          <div className="divide-y divide-slate-700">
            {round.holes.map((hole, idx) => {
              const stats = getHoleStats(idx);
              const isCurrentHole = idx === round.currentHoleIndex && !hole.isComplete;
              const isExpanded = expandedHole === hole.number;
              const hasData = hole.shots.length > 0 || hole.isComplete;

              return (
                <div key={hole.number}>
                  <div
                    onClick={() => hasData && toggleHole(hole.number)}
                    className={`${
                      isCurrentHole ? 'bg-emerald-500/10' : ''
                    } ${
                      hasData ? 'cursor-pointer hover:bg-slate-700/50' : ''
                    } transition-colors px-4 py-3 grid grid-cols-4 gap-2 items-center`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{hole.number}</span>
                      {isCurrentHole && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          Now
                        </span>
                      )}
                      {hasData && (
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform ml-auto ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-slate-300">{hole.par}</span>
                    </div>
                    <div className="text-center">
                      {hole.isComplete ? (
                        <span className="text-lg font-bold text-white">{stats.strokes}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                    <div className="text-center">
                      {hole.isComplete ? (
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                            stats.score < 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : stats.score === 0
                              ? 'bg-slate-600 text-slate-300 border border-slate-500'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {stats.scoreName}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>

                  {isExpanded && hasData && (
                    <div className="bg-slate-900 px-4 py-3 border-t border-slate-700">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-300">Yardage:</span>
                            <span>{hole.yardage}y</span>
                          </div>
                          {hole.hazard && hole.hazardType && (
                            <div className="flex items-center gap-1">
                              {hole.hazardType === 'Water' ? (
                                <Droplet className="w-3 h-3 text-blue-400" />
                              ) : (
                                <Mountain className="w-3 h-3 text-amber-500" />
                              )}
                              <span>{hole.hazardType} {hole.hazard}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-300">Wind:</span>
                            <span>{hole.windSpeed}mph {hole.windDir}</span>
                          </div>
                        </div>

                        {hole.shots.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-slate-300 mb-2">Shots:</div>
                            <div className="space-y-2">
                              {hole.shots.map((shot, shotIdx) => (
                                <div
                                  key={shot.id}
                                  className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-500">#{shotIdx + 1}</span>
                                        <span className="text-sm font-semibold text-white">{shot.club}</span>
                                        <span className="text-xs text-slate-500">{shot.inputDirection}</span>
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        <span className="font-semibold text-slate-300">{shot.inputDistance}y</span>
                                        {shot.distancePenalty > 0 && (
                                          <span className="text-amber-400 ml-2">
                                            (plays like {shot.inputDistance + shot.distancePenalty}y)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-semibold text-slate-300">
                                        {shot.remainingDistance}y left
                                      </div>
                                      {shot.penaltyStrokes > 0 && (
                                        <span className="text-xs text-red-400 font-semibold">
                                          +{shot.penaltyStrokes} stroke
                                        </span>
                                      )}
                                      {shot.hitHazard && (
                                        <div className="text-xs text-blue-400 font-semibold">
                                          Hit hazard
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {hole.isComplete && (
                          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-slate-300">Putts</span>
                              <span className="text-lg font-bold text-white">{hole.putts}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {round.isRoundComplete && (
          <div className="mt-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 text-center border border-amber-400 glow-amber">
            <Trophy className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2">Round Complete!</h2>
            <div className="text-4xl font-bold mb-1">{roundStats.totalStrokes}</div>
            <div className="text-lg">
              {roundStats.score > 0 ? '+' : ''}{roundStats.score} vs Par
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
