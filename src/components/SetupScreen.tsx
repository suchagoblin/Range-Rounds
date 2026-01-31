import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { Flag, Wind, User, History, BookOpen, Users, X, DollarSign, Trophy } from 'lucide-react';
import { generateHoles } from '../utils/golfLogic';
import { supabase } from '../lib/supabase';
import { GameType } from '../types/golf';

interface SetupScreenProps {
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  onOpenCourses: () => void;
}

interface FamousCourse {
  id: string;
  name: string;
  description: string;
}

export default function SetupScreen({ onOpenProfile, onOpenHistory, onOpenCourses }: SetupScreenProps) {
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
    setShowFamousCoursesDialog(false);
    setShowCompetitionDialog(true);
  };

  const handleCreateMultiplayer = async () => {
    if (!courseName.trim()) {
      alert('Please enter a course name');
      return;
    }

    if (!profile) {
      alert('Profile not loaded');
      return;
    }

    const holes = generateHoles(holeCount);

    const { data: course } = await supabase
      .from('courses')
      .insert({
        profile_id: profile.id,
        name: courseName,
        hole_count: holeCount,
        is_shared: false,
      })
      .select()
      .single();

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
      }
    }
  };

  const handleStartPlaying = async () => {
    if (pendingCourseId && holeCount) {
      const mulliganCount = parseInt(mulligans) || 2;
      await startRound(holeCount, pendingCourseId, mulliganCount);

      if (gameType !== 'stroke_play') {
        const bet = parseFloat(betAmount) || 1;
        await addCompetition(gameType, bet);
      }

      setShowMultiplayerDialog(false);
      setMultiplayerMode(null);
      setShareCode(null);
      setPendingCourseId(null);
    }
  };

  const handleStartSoloRound = async (holes: 3 | 9 | 18) => {
    setHoleCount(holes);
    setShowCompetitionDialog(true);
  };

  const handleConfirmSoloStart = async () => {
    const mulliganCount = parseInt(mulligans) || 2;
    await startRound(holeCount, pendingCourseId || undefined, mulliganCount);

    if (gameType !== 'stroke_play') {
      const bet = parseFloat(betAmount) || 1;
      await addCompetition(gameType, bet);
    }

    setShowCompetitionDialog(false);
    setPendingCourseId(null);
  };

  const handleJoinMultiplayer = async () => {
    if (joinCode.length !== 6) {
      alert('Please enter a 6-character code');
      return;
    }

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
        setHoleCount(courseData[0].hole_count);
        setShowMultiplayerDialog(false);
        setShowCompetitionDialog(true);
      }
    } else {
      alert('Invalid code. Please check and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-5 shadow-lg">
            <Flag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Range Rounds</h1>
          <p className="text-gray-600 text-base">Virtual Course Simulator</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Get Started</h2>
            <div className="flex gap-2">
              <button
                onClick={onOpenCourses}
                className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Manage Courses"
              >
                <BookOpen className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onOpenHistory}
                className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="View Round History"
              >
                <History className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onOpenProfile}
                className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Manage Profile"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setShowMultiplayerDialog(true);
              setMultiplayerMode(null);
            }}
            className="w-full mb-3 py-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all border border-blue-600"
          >
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <Users className="w-6 h-6" />
              <span>Play With Friends</span>
            </div>
            <div className="text-sm font-normal opacity-90">Create or join a shared course</div>
          </button>

          <button
            onClick={() => setShowFamousCoursesDialog(true)}
            className="w-full mb-6 py-5 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-2xl font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all border border-amber-600"
          >
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <Trophy className="w-6 h-6" />
              <span>Famous Courses</span>
            </div>
            <div className="text-sm font-normal opacity-90">Play world-class championship courses</div>
          </button>

          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-3 text-gray-400 text-sm font-medium">
              <div className="h-px bg-gray-200 w-20"></div>
              <span>Quick Play</span>
              <div className="h-px bg-gray-200 w-20"></div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStartSoloRound(3)}
              className="w-full py-4 bg-white text-gray-900 rounded-2xl font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all border-2 border-orange-200 hover:border-orange-300"
            >
              <div className="flex items-center justify-between px-4">
                <div className="text-left">
                  <div className="text-lg font-bold text-orange-600">3 Holes</div>
                  <div className="text-sm font-normal text-gray-500">Practice Round</div>
                </div>
                <div className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-lg">~10 balls</div>
              </div>
            </button>

            <button
              onClick={() => handleStartSoloRound(9)}
              className="w-full py-4 bg-white text-gray-900 rounded-2xl font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all border-2 border-emerald-200 hover:border-emerald-300"
            >
              <div className="flex items-center justify-between px-4">
                <div className="text-left">
                  <div className="text-lg font-bold text-emerald-600">9 Holes</div>
                  <div className="text-sm font-normal text-gray-500">Quick Round</div>
                </div>
                <div className="text-sm text-gray-600 bg-emerald-50 px-3 py-1 rounded-lg">~30 balls</div>
              </div>
            </button>

            <button
              onClick={() => handleStartSoloRound(18)}
              className="w-full py-4 bg-white text-gray-900 rounded-2xl font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all border-2 border-blue-200 hover:border-blue-300"
            >
              <div className="flex items-center justify-between px-4">
                <div className="text-left">
                  <div className="text-lg font-bold text-blue-600">18 Holes</div>
                  <div className="text-sm font-normal text-gray-500">Full Round</div>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">~60 balls</div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-base text-gray-900 mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-600" />
            How It Works
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Hit your ball at the driving range</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Estimate your carry distance and direction</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Input your shot details in the app</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>App calculates ball position, wind, and penalties</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span>Continue until you reach the green, then select putts</span>
            </li>
          </ul>
        </div>

        {showMultiplayerDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Play With Friends</h2>
                <button
                  onClick={() => {
                    setShowMultiplayerDialog(false);
                    setMultiplayerMode(null);
                    setShareCode(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {shareCode ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Course Created!</h3>
                  <p className="text-gray-600 mb-4">Share this code with your friends:</p>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                    <div className="text-4xl font-bold text-purple-700 tracking-widest">{shareCode}</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Friends can join anytime using this code. Click below when you're ready!
                  </p>
                  <button
                    onClick={handleStartPlaying}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Start Playing
                  </button>
                </div>
              ) : multiplayerMode === null ? (
                <div className="space-y-3">
                  <p className="text-gray-600 mb-4">Choose how you want to play with friends:</p>
                  <button
                    onClick={() => setMultiplayerMode('create')}
                    className="w-full py-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Flag className="w-5 h-5" />
                    Create New Course
                  </button>
                  <button
                    onClick={() => setMultiplayerMode('join')}
                    className="w-full py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    Join With Code
                  </button>
                </div>
              ) : multiplayerMode === 'create' ? (
                <div className="space-y-4">
                  <p className="text-gray-600">Create a course that friends can join:</p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g., Friday Range Session"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Holes *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[3, 9, 18].map((count) => (
                        <button
                          key={count}
                          onClick={() => setHoleCount(count as 3 | 9 | 18)}
                          className={`py-3 rounded-lg font-semibold transition-all ${
                            holeCount === count
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateMultiplayer}
                      disabled={!courseName.trim()}
                      className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create & Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">Enter your friend's share code:</p>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold uppercase tracking-widest"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMultiplayerMode(null)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoinMultiplayer}
                      disabled={joinCode.length !== 6}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Round Options</h2>
                <button
                  onClick={() => setShowCompetitionDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mulligans Allowed
                  </label>
                  <input
                    type="number"
                    value={mulligans}
                    onChange={(e) => setMulligans(e.target.value)}
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Do-overs allowed during the round</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Game Type
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setGameType('stroke_play')}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        gameType === 'stroke_play'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Stroke Play (No Betting)
                    </button>
                    <button
                      onClick={() => setGameType('skins')}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        gameType === 'skins'
                          ? 'bg-yellow-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Nassau
                      </div>
                    </button>
                  </div>
                </div>

                {gameType !== 'stroke_play' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bet Amount ($)
                    </label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="0"
                      step="0.50"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {gameType === 'skins' ? 'Amount per skin' : 'Amount per bet'}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConfirmSoloStart}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Start Round
                </button>
              </div>
            </div>
          </div>
        )}

        {showFamousCoursesDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Famous Courses</h2>
                    <p className="text-sm text-gray-600">World-class championship courses</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFamousCoursesDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {famousCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectFamousCourse(course.id)}
                    className="w-full text-left p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <Flag className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {course.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {course.description}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
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
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
