import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { Flag, Wind, User, History, BookOpen, Users, X, DollarSign, Trophy, MapPin } from 'lucide-react';
import { generateHoles } from '../utils/golfLogic';
import { supabase } from '../lib/supabase';
import { GameType } from '../types/golf';
import { showToast } from '../utils/toast';
import { validateCourseName, validateShareCode } from '../utils/validation';

interface SetupScreenProps {
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  onOpenCourses: () => void;
  onOpenLeaderboard: () => void;
}

interface FamousCourse {
  id: string;
  name: string;
  description: string;
}

export default function SetupScreen({ onOpenProfile, onOpenHistory, onOpenCourses, onOpenLeaderboard }: SetupScreenProps) {
  const { startRound, shareCourse, joinSharedCourse, profile, addCompetition } = useGolf();
  const [showMultiplayerDialog, setShowMultiplayerDialog] = useState(false);
  const [showCompetitionDialog, setShowCompetitionDialog] = useState(false);
  const [showFamousCoursesDialog, setShowFamousCoursesDialog] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState<'create' | 'join' | null>(null);
  const [holeCount, setHoleCount] = useState<3 | 9 | 18>(9);
  const [courseName, setCourseName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<GameType>('stroke_play');
  const [betAmount, setBetAmount] = useState('1');
  const [mulligans, setMulligans] = useState('2');
  const [famousCourses, setFamousCourses] = useState<FamousCourse[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [isMultiplayerRound, setIsMultiplayerRound] = useState(false);

  const getDefaultMulligans = (holes: 3 | 9 | 18): string => {
    if (holes === 3) return '1';
    if (holes === 9) return '2';
    return '3';
  };

  useEffect(() => {
    loadFamousCourses();
  }, []);

  const loadFamousCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('id, name, description')
      .eq('is_famous', true)
      .order('name', { ascending: true });

    if (data) {
      setFamousCourses(data);
    }
  };

  const handleSelectFamousCourse = (courseId: string) => {
    setPendingCourseId(courseId);
    setHoleCount(18);
    setMulligans(getDefaultMulligans(18));
    setShowFamousCoursesDialog(false);
    setIsMultiplayerRound(false);
    setGameType('stroke_play');
    setShowCompetitionDialog(true);
  };

  const handleCreateMultiplayer = async () => {
    const validation = validateCourseName(courseName);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid course name', 'error');
      return;
    }

    if (!profile) {
      showToast('Profile not loaded', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const holes = generateHoles(holeCount);

      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          profile_id: profile.id,
          name: courseName,
          hole_count: holeCount,
          is_shared: false,
        })
        .select()
        .single();

      if (error) throw error;

      if (course) {
        const courseHolesData = holes.map((hole) => ({
          course_id: course.id,
          hole_number: hole.number,
          par: hole.par,
          yardage: hole.yardage,
          hazard: hole.hazard,
          hazard_type: hole.hazardType,
          wind_speed: hole.windSpeed,
          wind_dir: hole.windDir,
        }));

        await supabase.from('course_holes').insert(courseHolesData);

        const code = await shareCourse(course.id);
        if (code) {
          setPendingCourseId(course.id);
          setShareCode(code);
          showToast('Course created successfully', 'success');
        }
      }
    } catch (error) {
      showToast('Failed to create course', 'error');
      console.error('Error creating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPlaying = () => {
    setShowMultiplayerDialog(false);
    setIsMultiplayerRound(true);
    setShowCompetitionDialog(true);
  };

  const handleStartSoloRound = async (holes: 3 | 9 | 18) => {
    setHoleCount(holes);
    setMulligans(getDefaultMulligans(holes));
    setIsMultiplayerRound(false);
    setGameType('stroke_play');
    setShowCompetitionDialog(true);
  };

  const handleConfirmSoloStart = async () => {
    setIsLoading(true);
    try {
      const mulliganCount = parseInt(mulligans) || 2;
      await startRound(holeCount, pendingCourseId || undefined, mulliganCount);

      if (gameType !== 'stroke_play') {
        const bet = parseFloat(betAmount) || 1;
        await addCompetition(gameType, bet);
      }

      setShowCompetitionDialog(false);
      setShowMultiplayerDialog(false);
      setMultiplayerMode(null);
      setShareCode(null);
      setPendingCourseId(null);
      setIsMultiplayerRound(false);
      showToast('Round started', 'success');
    } catch (error) {
      showToast('Failed to start round', 'error');
      console.error('Error starting round:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMultiplayer = async () => {
    const validation = validateShareCode(joinCode);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid share code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const courseId = await joinSharedCourse(joinCode.toUpperCase());
      if (courseId) {
        const courseData = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/courses?id=eq.${courseId}`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }).then(r => r.json());

        if (courseData && courseData[0]) {
          setPendingCourseId(courseId);
          const holes = courseData[0].hole_count as 3 | 9 | 18;
          setHoleCount(holes);
          setMulligans(getDefaultMulligans(holes));
          setShowMultiplayerDialog(false);
          setIsMultiplayerRound(true);
          setShowCompetitionDialog(true);
          showToast('Joined course successfully', 'success');
        }
      } else {
        showToast('Invalid code. Please check and try again.', 'error');
      }
    } catch (error) {
      showToast('Failed to join course', 'error');
      console.error('Error joining course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-topo flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-5 glow-green">
            <Flag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow-green">Range Rounds</h1>
          <p className="text-slate-400 text-base">Virtual Course Simulator</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Get Started</h2>
            <div className="flex gap-2">
              <button
                onClick={onOpenLeaderboard}
                className="p-2.5 bg-amber-500/20 rounded-xl hover:bg-amber-500/30 transition-all border border-amber-500/30"
                title="Community Leaderboard"
                aria-label="View community leaderboard"
              >
                <Trophy className="w-5 h-5 text-amber-400" aria-hidden="true" />
              </button>
              <button
                onClick={onOpenCourses}
                className="p-2.5 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all border border-slate-600"
                title="Manage Courses"
                aria-label="Manage courses"
              >
                <BookOpen className="w-5 h-5 text-slate-300" aria-hidden="true" />
              </button>
              <button
                onClick={onOpenHistory}
                className="p-2.5 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all border border-slate-600"
                title="View Round History"
                aria-label="View round history"
              >
                <History className="w-5 h-5 text-slate-300" aria-hidden="true" />
              </button>
              <button
                onClick={onOpenProfile}
                className="p-2.5 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all border border-slate-600"
                title="Manage Profile"
                aria-label="Manage profile"
              >
                <User className="w-5 h-5 text-slate-300" aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setShowMultiplayerDialog(true);
              setMultiplayerMode(null);
            }}
            className="w-full mb-3 py-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-semibold text-base hover:shadow-lg transform hover:scale-[1.01] transition-all border border-blue-400 glow-blue"
          >
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <Users className="w-6 h-6" />
              <span>Play With Friends</span>
            </div>
            <div className="text-sm font-normal text-blue-100">Create or join a shared course</div>
          </button>

          <button
            onClick={() => setShowFamousCoursesDialog(true)}
            className="w-full mb-6 py-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl font-semibold text-base hover:shadow-lg transform hover:scale-[1.01] transition-all border border-amber-400 glow-amber"
          >
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <MapPin className="w-6 h-6" />
              <span>Famous Courses</span>
            </div>
            <div className="text-sm font-normal text-amber-100">Play world-class championship courses</div>
          </button>

          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-3 text-slate-500 text-sm font-medium">
              <div className="h-px bg-slate-700 w-20"></div>
              <span>Quick Play</span>
              <div className="h-px bg-slate-700 w-20"></div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStartSoloRound(3)}
              className="w-full py-4 bg-slate-700/50 text-white rounded-2xl font-semibold text-base hover:bg-slate-700 transform hover:scale-[1.01] transition-all border border-orange-500/30 hover:border-orange-500/50"
            >
              <div className="flex items-center justify-between px-4">
                <div className="text-left">
                  <div className="text-lg font-bold text-orange-400">3 Holes</div>
                  <div className="text-sm font-normal text-slate-400">Practice Round</div>
                </div>
                <div className="text-sm text-slate-300 bg-orange-500/20 px-3 py-1 rounded-lg border border-orange-500/30">~10 balls</div>
              </div>
            </button>

            <button
              onClick={() => handleStartSoloRound(9)}
              className="w-full py-4 bg-slate-700/50 text-white rounded-2xl font-semibold text-base hover:bg-slate-700 transform hover:scale-[1.01] transition-all border border-emerald-500/30 hover:border-emerald-500/50"
            >
              <div className="flex items-center justify-between px-4">
                <div className="text-left">
                  <div className="text-lg font-bold text-emerald-400">9 Holes</div>
                  <div className="text-sm font-normal text-slate-400">Quick Round</div>
                </div>
                <div className="text-sm text-slate-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">~30 balls</div>
              </div>
            </button>

            <button
              onClick={() => handleStartSoloRound(18)}
              className="w-full py-4 bg-slate-700/50 text-white rounded-2xl font-semibold text-base hover:bg-slate-700 transform hover:scale-[1.01] transition-all border border-blue-500/30 hover:border-blue-500/50"
            >
              <div className="flex items-center justify-between px-4">
                <div className="text-left">
                  <div className="text-lg font-bold text-blue-400">18 Holes</div>
                  <div className="text-sm font-normal text-slate-400">Full Round</div>
                </div>
                <div className="text-sm text-slate-300 bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30">~60 balls</div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700 p-6">
          <h3 className="font-semibold text-base text-white mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-400" />
            How It Works
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/30">1</span>
              <span>Hit your ball at the driving range</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/30">2</span>
              <span>Estimate your carry distance and direction</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/30">3</span>
              <span>Input your shot details in the app</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/30">4</span>
              <span>App calculates ball position, wind, and penalties</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-500/30">5</span>
              <span>Continue until you reach the green, then select putts</span>
            </li>
          </ul>
        </div>

        {showMultiplayerDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Play With Friends</h2>
                <button
                  onClick={() => {
                    setShowMultiplayerDialog(false);
                    setMultiplayerMode(null);
                    setShareCode(null);
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {shareCode ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30">
                    <Users className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Course Created!</h3>
                  <p className="text-slate-400 mb-4">Share this code with your friends:</p>
                  <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-lg p-4 mb-6 glow-green-sm">
                    <div className="text-4xl font-bold text-emerald-400 tracking-widest">{shareCode}</div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    Friends can join anytime using this code. Click below when you're ready!
                  </p>
                  <button
                    onClick={handleStartPlaying}
                    className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all border border-emerald-400 glow-green"
                  >
                    Start Playing
                  </button>
                </div>
              ) : multiplayerMode === null ? (
                <div className="space-y-3">
                  <p className="text-slate-400 mb-4">Choose how you want to play with friends:</p>
                  <button
                    onClick={() => setMultiplayerMode('create')}
                    className="w-full py-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-purple-400"
                  >
                    <Flag className="w-5 h-5" />
                    Create New Course
                  </button>
                  <button
                    onClick={() => setMultiplayerMode('join')}
                    className="w-full py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-blue-400"
                  >
                    <Users className="w-5 h-5" />
                    Join With Code
                  </button>
                </div>
              ) : multiplayerMode === 'create' ? (
                <div className="space-y-4">
                  <p className="text-slate-400">Create a course that friends can join:</p>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g., Friday Range Session"
                      className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Number of Holes *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[3, 9, 18].map((count) => (
                        <button
                          key={count}
                          onClick={() => {
                            const holes = count as 3 | 9 | 18;
                            setHoleCount(holes);
                            setMulligans(getDefaultMulligans(holes));
                          }}
                          className={`py-3 rounded-lg font-semibold transition-all ${
                            holeCount === count
                              ? 'bg-emerald-500 text-white border border-emerald-400 glow-green-sm'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMultiplayerMode(null)}
                      className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors border border-slate-600"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateMultiplayer}
                      disabled={!courseName.trim()}
                      className="flex-1 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400"
                    >
                      Create & Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400">Enter your friend's share code:</p>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-center text-2xl font-bold text-emerald-400 uppercase tracking-widest placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMultiplayerMode(null)}
                      className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors border border-slate-600"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoinMultiplayer}
                      disabled={joinCode.length !== 6}
                      className="flex-1 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400"
                    >
                      Join Course
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showCompetitionDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Round Options</h2>
                <button
                  onClick={() => setShowCompetitionDialog(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Mulligans Allowed
                  </label>
                  <input
                    type="number"
                    value={mulligans}
                    onChange={(e) => setMulligans(e.target.value)}
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Do-overs allowed during the round</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Game Type
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setGameType('stroke_play')}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        gameType === 'stroke_play'
                          ? 'bg-emerald-500 text-white border border-emerald-400 glow-green-sm'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      }`}
                    >
                      Stroke Play (No Betting)
                    </button>
                    {isMultiplayerRound && (
                      <>
                        <button
                          onClick={() => setGameType('skins')}
                          className={`w-full py-3 rounded-lg font-semibold transition-all ${
                            gameType === 'skins'
                              ? 'bg-amber-500 text-white border border-amber-400 glow-amber'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Skins
                          </div>
                        </button>
                        <button
                          onClick={() => setGameType('nassau')}
                          className={`w-full py-3 rounded-lg font-semibold transition-all ${
                            gameType === 'nassau'
                              ? 'bg-blue-500 text-white border border-blue-400 glow-blue'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Nassau
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {gameType !== 'stroke_play' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Bet Amount ($)
                    </label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="0"
                      step="0.50"
                      className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {gameType === 'skins' ? 'Amount per skin' : 'Amount per bet'}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConfirmSoloStart}
                  className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all border border-emerald-400 glow-green"
                >
                  Start Round
                </button>
              </div>
            </div>
          </div>
        )}

        {showFamousCoursesDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Famous Courses</h2>
                    <p className="text-sm text-slate-400">World-class championship courses</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFamousCoursesDialog(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {famousCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectFamousCourse(course.id)}
                    className="w-full text-left p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <Flag className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {course.name}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {course.description}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30">
                          <span>18 Holes</span>
                          <span>•</span>
                          <span>Par 72</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {famousCourses.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No famous courses available yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
