import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useGolf } from './context/GolfContext';
import { AuthScreen } from './components/AuthScreen';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import ProfileScreen from './components/ProfileScreen';
import RoundHistory from './components/RoundHistory';
import CourseManager from './components/CourseManager';
import RoundSummary from './components/RoundSummary';
import CommunityLeaderboard from './components/CommunityLeaderboard';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { round, profile, clubs, updateProfile, updateWindSettings, addClub, updateClub, deleteClub, exitRound } = useGolf();
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-topo flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (showProfile) {
    return (
      <ProfileScreen
        profileName={profile?.name || 'Golfer'}
        clubs={clubs}
        windEnabled={profile?.wind_enabled || false}
        windSpeed={profile?.wind_speed || 10}
        windDirection={profile?.wind_direction || 'Headwind'}
        onUpdateProfile={updateProfile}
        onUpdateWindSettings={updateWindSettings}
        onAddClub={addClub}
        onUpdateClub={updateClub}
        onDeleteClub={deleteClub}
        onBack={() => setShowProfile(false)}
      />
    );
  }

  if (showHistory) {
    return <RoundHistory onBack={() => setShowHistory(false)} />;
  }

  if (showCourses) {
    return <CourseManager onBack={() => setShowCourses(false)} />;
  }

  if (showLeaderboard) {
    return <CommunityLeaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  if (!round) {
    return (
      <SetupScreen
        onOpenProfile={() => setShowProfile(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenCourses={() => setShowCourses(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />
    );
  }

  if (round.isRoundComplete && !showSummary) {
    setShowSummary(true);
  }

  if (showSummary && round.isRoundComplete) {
    return (
      <RoundSummary
        onClose={() => setShowSummary(false)}
        onNewRound={() => {
          setShowSummary(false);
          exitRound();
        }}
      />
    );
  }

  return <GameScreen onOpenProfile={() => setShowProfile(true)} />;
}

export default App;
