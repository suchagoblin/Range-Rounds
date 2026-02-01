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
import DrillsScreen from './components/DrillsScreen';
import { GuestBanner } from './components/GuestBanner';

function App() {
  const { isAuthenticated, isLoading, isGuest, logout } = useAuth();
  const { round, profile, clubs, updateProfile, updateWindSettings, addClub, updateClub, deleteClub, exitRound } = useGolf();
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDrills, setShowDrills] = useState(false);

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

  // Handle sign up from guest banner - log out to show auth screen
  const handleSignUpFromGuest = () => {
    logout();
  };

  // Wrapper component to add guest banner
  const withGuestBanner = (content: React.ReactNode) => (
    <div className="min-h-screen flex flex-col">
      <GuestBanner onSignUp={handleSignUpFromGuest} />
      <div className="flex-1">{content}</div>
    </div>
  );

  if (showProfile) {
    // Don't show profile for guests - they can't save settings anyway
    if (isGuest) {
      setShowProfile(false);
      return null;
    }
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
    if (isGuest) {
      // Guests don't have history
      setShowHistory(false);
      return null;
    }
    return <RoundHistory onBack={() => setShowHistory(false)} />;
  }

  if (showCourses) {
    if (isGuest) {
      // Guests can't access courses
      setShowCourses(false);
      return null;
    }
    return <CourseManager onBack={() => setShowCourses(false)} />;
  }

  if (showLeaderboard) {
    // Guests can view leaderboard
    return withGuestBanner(<CommunityLeaderboard onClose={() => setShowLeaderboard(false)} />);
  }

  if (showDrills) {
    return withGuestBanner(<DrillsScreen onBack={() => setShowDrills(false)} />);
  }

  if (!round) {
    return withGuestBanner(
      <SetupScreen
        onOpenProfile={() => setShowProfile(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenCourses={() => setShowCourses(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenDrills={() => setShowDrills(true)}
      />
    );
  }

  if (round.isRoundComplete && !showSummary) {
    setShowSummary(true);
  }

  if (showSummary && round.isRoundComplete) {
    return withGuestBanner(
      <RoundSummary
        onClose={() => setShowSummary(false)}
        onNewRound={() => {
          setShowSummary(false);
          exitRound();
        }}
      />
    );
  }

  return withGuestBanner(<GameScreen onOpenProfile={() => setShowProfile(true)} />);
}

export default App;
