import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { ArrowLeft, BookOpen, Trash2, Share2, Users, Play, X, Trophy } from 'lucide-react';
import CourseLeaderboard from './CourseLeaderboard';

interface Course {
  id: string;
  name: string;
  description: string | null;
  hole_count: number;
  is_shared: boolean;
  share_code: string | null;
  created_at: string;
}

interface CourseManagerProps {
  onBack: () => void;
}

export default function CourseManager({ onBack }: CourseManagerProps) {
  const { getSavedCourses, deleteCourse, shareCourse, joinSharedCourse, startRound } = useGolf();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPlayDialog, setShowPlayDialog] = useState(false);
  const [courseToPlay, setCourseToPlay] = useState<{ id: string; holeCount: number } | null>(null);
  const [mulligans, setMulligans] = useState('2');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const data = await getSavedCourses();
    setCourses(data as Course[]);
    setLoading(false);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(courseId);
      await loadCourses();
    }
  };

  const handleShareCourse = async (courseId: string) => {
    const code = await shareCourse(courseId);
    if (code) {
      setShareCode(code);
      await loadCourses();
    }
  };

  const handleJoinCourse = async () => {
    if (!joinCode.trim()) return;

    const courseId = await joinSharedCourse(joinCode.toUpperCase());
    if (courseId) {
      setShowJoinDialog(false);
      setJoinCode('');
      await loadCourses();
      alert('Successfully joined the course!');
    } else {
      alert('Invalid share code. Please check and try again.');
    }
  };

  const handlePlayCourse = (courseId: string, holeCount: number) => {
    setCourseToPlay({ id: courseId, holeCount });
    setShowPlayDialog(true);
  };

  const handleConfirmPlay = async () => {
    if (!courseToPlay) return;
    const mulliganCount = parseInt(mulligans) || 0;
    await startRound(courseToPlay.holeCount as 3 | 9 | 18, courseToPlay.id, mulliganCount);
    setShowPlayDialog(false);
    setCourseToPlay(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-topo p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-400">Loading courses...</p>
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
            <BookOpen className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">My Courses</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium border border-blue-400"
            >
              <Users className="w-5 h-5" />
              Join Course
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all text-slate-300 font-medium border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>

        {showJoinDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Join Shared Course</h2>
                <button
                  onClick={() => setShowJoinDialog(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400 mb-4">Enter the 6-character share code to join a friend's course:</p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-center text-2xl font-bold text-emerald-400 uppercase tracking-widest mb-4 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleJoinCourse}
                disabled={joinCode.length !== 6}
                className="w-full py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400"
              >
                Join Course
              </button>
            </div>
          </div>
        )}

        {shareCode && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30">
                  <Share2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Course Shared!</h2>
                <p className="text-slate-400 mb-4">Share this code with your friends:</p>
                <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-lg p-4 mb-6 glow-green-sm">
                  <div className="text-4xl font-bold text-emerald-400 tracking-widest">{shareCode}</div>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Your friends can enter this code to play the same course and compete on the leaderboard!
                </p>
                <button
                  onClick={() => setShareCode(null)}
                  className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all border border-emerald-400 glow-green"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No saved courses</h2>
            <p className="text-slate-500">Play a round and save the course layout to replay it later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{course.name}</h3>
                      {course.is_shared && (
                        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-semibold border border-blue-500/30">
                          <Users className="w-3 h-3" />
                          Shared
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-slate-400 mb-3">{course.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span>{course.hole_count} holes</span>
                      <span>•</span>
                      <span>Created {formatDate(course.created_at)}</span>
                    </div>

                    {course.is_shared && course.share_code && (
                      <div className="bg-blue-500/10 px-3 py-2 rounded-lg inline-block mb-3 border border-blue-500/20">
                        <span className="text-xs text-blue-400 font-medium">Share Code: </span>
                        <span className="text-sm font-bold text-blue-300">{course.share_code}</span>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handlePlayCourse(course.id, course.hole_count)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all border border-emerald-400"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>

                      {course.is_shared && (
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all border border-purple-400"
                        >
                          <Trophy className="w-4 h-4" />
                          Leaderboard
                        </button>
                      )}

                      {!course.is_shared && (
                        <button
                          onClick={() => handleShareCourse(course.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all border border-blue-400"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <CourseLeaderboard
            courseId={selectedCourse.id}
            courseName={selectedCourse.name}
            onClose={() => setSelectedCourse(null)}
          />
        )}

        {showPlayDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Round Options</h2>
                <button
                  onClick={() => {
                    setShowPlayDialog(false);
                    setCourseToPlay(null);
                  }}
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

                <button
                  onClick={handleConfirmPlay}
                  className="w-full py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all border border-emerald-400 glow-green"
                >
                  Start Round
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
