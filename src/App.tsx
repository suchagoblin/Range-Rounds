import { useState } from 'react';
import { useGolf } from './context/GolfContext';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import ProfileScreen from './components/ProfileScreen';
import RoundHistory from './components/RoundHistory';
import CourseManager from './components/CourseManager';
import RoundSummary from './components/RoundSummary';

function App() {
  const { round, profile, clubs, updateProfile, addClub, updateClub, deleteClub, startRound } = useGolf();
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  if (showProfile) {
    return (
      <ProfileScreen
        profileName={profile?.name || 'Golfer'}
        clubs={clubs}
        onUpdateProfile={updateProfile}
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

  if (!round) {
    return (
      <SetupScreen
        onOpenProfile={() => setShowProfile(true)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenCourses={() => setShowCourses(true)}
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
          window.location.reload();
        }}
      />
    );
  }

  return <GameScreen onOpenProfile={() => setShowProfile(true)} />;
}

export default App;
