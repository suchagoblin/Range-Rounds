import { useState, useEffect } from 'react';
import { ClubInBag, ClubName, ClubType, BestRound } from '../types/golf';
import { Plus, Trash2, Save, User, Trophy, LogOut, Wind, Mail, Info, X, Star, Zap, Activity } from 'lucide-react';
import { useGolf } from '../context/GolfContext';
import { useAuth } from '../context/AuthContext';
import { SecurityQuestions } from './SecurityQuestions';
import { supabase } from '../lib/supabase';
import { calculatePlayerStats, PlayerStats } from '../utils/gamification';

interface ProfileScreenProps {
  profileName: string;
  clubs: ClubInBag[];
  windEnabled: boolean;
  windSpeed: number;
  windDirection: string;
  onUpdateProfile: (name: string) => void;
  onUpdateWindSettings: (windEnabled: boolean, windSpeed: number, windDirection: string) => void;
  onAddClub: (clubType: ClubType, clubName: ClubName, yardage: number) => void;
  onUpdateClub: (clubId: string, yardage: number) => void;
  onDeleteClub: (clubId: string) => void;
  onBack: () => void;
}

const CLUB_OPTIONS: Record<ClubType, ClubName[]> = {
  Driver: ['Driver'],
  Wood: ['2 Wood', '3 Wood', '4 Wood', '5 Wood', '7 Wood'],
  Hybrid: ['2 Hybrid', '3 Hybrid', '4 Hybrid', '5 Hybrid'],
  Iron: ['1 Iron', '2 Iron', '3 Iron', '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron'],
  Wedge: ['Pitching Wedge', 'Gap Wedge', 'Sand Wedge', 'Lob Wedge'],
  Putter: ['Putter']
};

export default function ProfileScreen({
  profileName,
  clubs,
  windEnabled,
  windSpeed,
  windDirection,
  onUpdateProfile,
  onUpdateWindSettings,
  onAddClub,
  onUpdateClub,
  onDeleteClub,
  onBack
}: ProfileScreenProps) {
  const { getBestRounds, getPastRounds } = useGolf();
  const { logout, username, profileId } = useAuth();
  const [name, setName] = useState(profileName);
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [selectedType, setSelectedType] = useState<ClubType>('Driver');
  const [selectedClub, setSelectedClub] = useState<ClubName>('Driver');
  const [yardage, setYardage] = useState('200');
  const [editingYardages, setEditingYardages] = useState<Record<string, string>>({});
  const [bestRounds, setBestRounds] = useState<BestRound[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [localWindEnabled, setLocalWindEnabled] = useState(windEnabled);
  const [localWindSpeed, setLocalWindSpeed] = useState(windSpeed.toString());
  const [localWindDirection, setLocalWindDirection] = useState(windDirection);

  // Recovery email state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [savedRecoveryEmail, setSavedRecoveryEmail] = useState<string | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
    loadRecoveryEmail();
  }, []);

  const loadData = async () => {
    const rounds = await getBestRounds(5);
    setBestRounds(rounds);

    const history = await getPastRounds();
    const stats = calculatePlayerStats(history);
    setPlayerStats(stats);
  };

  const loadRecoveryEmail = async () => {
    if (!profileId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('recovery_email')
      .eq('id', profileId)
      .single();

    if (!error && data?.recovery_email) {
      setSavedRecoveryEmail(data.recovery_email);
      setRecoveryEmail(data.recovery_email);
    }
  };

  const handleSaveRecoveryEmail = async () => {
    if (!profileId) return;

    const emailToSave = recoveryEmail.trim().toLowerCase() || null;

    // Basic validation if email is provided
    if (emailToSave && !emailToSave.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setEmailSaving(true);
    setEmailMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ recovery_email: emailToSave })
      .eq('id', profileId);

    if (error) {
      if (error.message.includes('unique_recovery_email')) {
        setEmailMessage({ type: 'error', text: 'This email is already in use by another account' });
      } else {
        setEmailMessage({ type: 'error', text: 'Failed to save email. Please try again.' });
      }
    } else {
      setSavedRecoveryEmail(emailToSave);
      setEmailMessage({ type: 'success', text: emailToSave ? 'Recovery email saved!' : 'Recovery email removed' });
      setTimeout(() => setEmailMessage(null), 3000);
    }

    setEmailSaving(false);
  };

  const handleRemoveRecoveryEmail = async () => {
    setRecoveryEmail('');
    setSavedRecoveryEmail(null);

    if (!profileId) return;

    setEmailSaving(true);
    setEmailMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ recovery_email: null })
      .eq('id', profileId);

    if (error) {
      setEmailMessage({ type: 'error', text: 'Failed to remove email. Please try again.' });
    } else {
      setEmailMessage({ type: 'success', text: 'Recovery email removed' });
      setTimeout(() => setEmailMessage(null), 3000);
    }

    setEmailSaving(false);
  };

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdateProfile(name.trim());
    }
  };

  const handleSaveWindSettings = () => {
    const speed = parseInt(localWindSpeed) || 10;
    onUpdateWindSettings(localWindEnabled, speed, localWindDirection);
  };

  const handleAddClub = () => {
    const yards = parseInt(yardage);
    if (yards > 0) {
      onAddClub(selectedType, selectedClub, yards);
      setIsAddingClub(false);
      setYardage('200');
    }
  };

  const handleUpdateYardage = (clubId: string) => {
    const yards = parseInt(editingYardages[clubId]);
    if (yards > 0) {
      onUpdateClub(clubId, yards);
      setEditingYardages(prev => {
        const updated = { ...prev };
        delete updated[clubId];
        return updated;
      });
    }
  };

  const groupedClubs = clubs.reduce((acc, club) => {
    if (!acc[club.club_type]) {
      acc[club.club_type] = [];
    }
    acc[club.club_type].push(club);
    return acc;
  }, {} as Record<ClubType, ClubInBag[]>);

  const clubTypeOrder: ClubType[] = ['Driver', 'Wood', 'Hybrid', 'Iron', 'Wedge', 'Putter'];

  return (
    <div className="min-h-screen bg-topo p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-7 h-7 text-emerald-400" />
              Profile
            </h1>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600"
            >
              Back to Game
            </button>
          </div>



          {playerStats && (
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-900/50 to-violet-900/50 rounded-xl border border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-indigo-500 flex items-center justify-center relative z-10">
                    <span className="text-3xl font-black text-white">{playerStats.level}</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400">
                    LEVEL
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-semibold text-indigo-200">Experience</div>
                    <div className="text-xs text-indigo-300">
                      <span className="text-white font-bold">{playerStats.currentXp}</span> / {playerStats.nextLevelXp} XP
                    </div>
                  </div>
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden border border-indigo-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${playerStats.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-indigo-500/10">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-white leading-none">{playerStats.totalHolesPlayed}</div>
                  <div className="text-[10px] text-indigo-300 uppercase tracking-wider mt-1">Holes</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-indigo-500/10">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold text-white leading-none">{playerStats.totalBirdies}</div>
                  <div className="text-[10px] text-indigo-300 uppercase tracking-wider mt-1">Birdies</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-indigo-500/10">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-white leading-none">{playerStats.bestStreak}</div>
                  <div className="text-[10px] text-indigo-300 uppercase tracking-wider mt-1">Best Streak</div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Section */}
          {playerStats && 'achievements' in playerStats && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {(playerStats as any).achievements.map((ach: any) => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${ach.unlocked
                        ? 'bg-slate-800/80 border-indigo-500/30'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${ach.unlocked
                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                        : 'bg-slate-800 border border-slate-700 grayscale'
                      }`}>
                      {ach.icon}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>
                        {ach.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ach.description}
                      </div>
                    </div>
                    {ach.unlocked && (
                      <div className="ml-auto">
                        <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          UNLOCKED
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Username
            </label>
            <div className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white font-medium">
              @{username}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Wind Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div>
                <div className="font-semibold text-white">Enable Wind</div>
                <div className="text-sm text-slate-400">Apply wind effects during gameplay</div>
              </div>
              <button
                onClick={() => setLocalWindEnabled(!localWindEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localWindEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localWindEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {localWindEnabled && (
              <div className="space-y-3 p-4 bg-sky-500/10 rounded-lg border border-sky-500/30">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Wind Speed (mph)
                  </label>
                  <input
                    type="number"
                    value={localWindSpeed}
                    onChange={(e) => setLocalWindSpeed(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-sky-500 focus:outline-none"
                    min="0"
                    max="50"
                  />
                  <p className="text-xs text-slate-500 mt-1">Set to your current real-life wind speed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Wind Direction
                  </label>
                  <select
                    value={localWindDirection}
                    onChange={(e) => setLocalWindDirection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Headwind">Headwind (into you)</option>
                    <option value="Tailwind">Tailwind (behind you)</option>
                    <option value="Left-to-Right">Left-to-Right (crosswind)</option>
                    <option value="Right-to-Left">Right-to-Left (crosswind)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Set to match your actual playing conditions</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveWindSettings}
              className="w-full px-4 py-2 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium border border-sky-400"
            >
              <Save className="w-4 h-4" />
              Save Wind Settings
            </button>
          </div>
        </div>

        <SecurityQuestions />

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Recovery Email</h2>
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded ml-auto">Optional</span>
          </div>

          <div className="mb-4 p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="mb-2">
                  Adding a recovery email lets you retrieve your username if you forget it.
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-300">Transparency:</strong> Your email is stored as-is (not encrypted) so we can match it when you need to recover your username. We don't send marketing emails or share your email. If you're concerned about privacy, you can skip this.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => {
                    setRecoveryEmail(e.target.value);
                    setEmailMessage(null);
                  }}
                  placeholder="your.email@example.com"
                  className="flex-1 px-4 py-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                  disabled={emailSaving}
                />
                {savedRecoveryEmail && (
                  <button
                    onClick={handleRemoveRecoveryEmail}
                    disabled={emailSaving}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 disabled:opacity-50"
                    title="Remove recovery email"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {emailMessage && (
              <div className={`p-3 rounded-lg ${emailMessage.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-red-500/20 border border-red-500/30'
                }`}>
                <p className={`text-sm text-center ${emailMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                  {emailMessage.text}
                </p>
              </div>
            )}

            <button
              onClick={handleSaveRecoveryEmail}
              disabled={emailSaving || recoveryEmail === (savedRecoveryEmail || '')}
              className="w-full px-4 py-2 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium border border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {emailSaving ? 'Saving...' : 'Save Recovery Email'}
            </button>
          </div>
        </div>

        {
          bestRounds.length > 0 && (
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Best Rounds</h2>
              </div>
              <div className="space-y-3">
                {bestRounds.map((round, index) => (
                  <div
                    key={round.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/10 to-amber-400/5 rounded-lg border border-amber-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-amber-400 text-amber-900' :
                        index === 1 ? 'bg-slate-400 text-slate-900' :
                          index === 2 ? 'bg-amber-600 text-white' :
                            'bg-slate-600 text-slate-300'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{round.total_score} strokes</div>
                        <div className="text-xs text-slate-400">
                          {new Date(round.created_at).toLocaleDateString()} • {round.hole_count} holes
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Bag</h2>
            <button
              onClick={() => setIsAddingClub(true)}
              className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-emerald-400"
            >
              <Plus className="w-4 h-4" />
              Add Club
            </button>
          </div>

          {isAddingClub && (
            <div className="mb-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <h3 className="font-semibold text-white mb-3">Add New Club</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Club Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      const type = e.target.value as ClubType;
                      setSelectedType(type);
                      setSelectedClub(CLUB_OPTIONS[type][0]);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {clubTypeOrder.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Club
                  </label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value as ClubName)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {CLUB_OPTIONS[selectedType].map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Typical Yardage
                  </label>
                  <input
                    type="number"
                    value={yardage}
                    onChange={(e) => setYardage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    min="1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddClub}
                    className="flex-1 px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium border border-emerald-400"
                  >
                    Add Club
                  </button>
                  <button
                    onClick={() => setIsAddingClub(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium border border-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {clubs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-2">No clubs in your bag yet.</p>
              <p className="text-sm">Add clubs to get personalized recommendations.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {clubTypeOrder.map(type => {
                const typeClubs = groupedClubs[type] || [];
                if (typeClubs.length === 0) return null;

                return (
                  <div key={type}>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {type}s
                    </h3>
                    <div className="space-y-2">
                      {typeClubs.map(club => (
                        <div
                          key={club.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-white">{club.club_name}</div>
                            <div className="text-sm text-slate-400">
                              {editingYardages[club.id] !== undefined ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="number"
                                    value={editingYardages[club.id]}
                                    onChange={(e) => setEditingYardages(prev => ({
                                      ...prev,
                                      [club.id]: e.target.value
                                    }))}
                                    className="w-24 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white focus:border-emerald-500 focus:outline-none"
                                    min="1"
                                  />
                                  <button
                                    onClick={() => handleUpdateYardage(club.id)}
                                    className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-medium hover:bg-emerald-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingYardages(prev => {
                                      const updated = { ...prev };
                                      delete updated[club.id];
                                      return updated;
                                    })}
                                    className="px-3 py-1 bg-slate-600 text-slate-300 rounded text-xs font-medium hover:bg-slate-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingYardages(prev => ({
                                    ...prev,
                                    [club.id]: club.yardage.toString()
                                  }))}
                                  className="hover:text-emerald-400"
                                >
                                  {club.yardage} yards
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteClub(club.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
