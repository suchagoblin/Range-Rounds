import { useState, useEffect } from 'react';
import { ClubInBag, ClubName, ClubType, BestRound } from '../types/golf';
import { Plus, Trash2, Save, User, Trophy, LogOut, Wind } from 'lucide-react';
import { useGolf } from '../context/GolfContext';
import { useAuth } from '../context/AuthContext';

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
  const { getBestRounds } = useGolf();
  const { logout, username } = useAuth();
  const [name, setName] = useState(profileName);
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [selectedType, setSelectedType] = useState<ClubType>('Driver');
  const [selectedClub, setSelectedClub] = useState<ClubName>('Driver');
  const [yardage, setYardage] = useState('200');
  const [editingYardages, setEditingYardages] = useState<Record<string, string>>({});
  const [bestRounds, setBestRounds] = useState<BestRound[]>([]);
  const [localWindEnabled, setLocalWindEnabled] = useState(windEnabled);
  const [localWindSpeed, setLocalWindSpeed] = useState(windSpeed.toString());
  const [localWindDirection, setLocalWindDirection] = useState(windDirection);

  useEffect(() => {
    loadBestRounds();
  }, []);

  const loadBestRounds = async () => {
    const rounds = await getBestRounds(5);
    setBestRounds(rounds);
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-7 h-7 text-green-600" />
              Profile
            </h1>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Game
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
              @{username}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your name"
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-bold text-gray-800">Wind Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-800">Enable Wind</div>
                <div className="text-sm text-gray-600">Apply wind effects during gameplay</div>
              </div>
              <button
                onClick={() => setLocalWindEnabled(!localWindEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localWindEnabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localWindEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {localWindEnabled && (
              <div className="space-y-3 p-4 bg-sky-50 rounded-lg border border-sky-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wind Speed (mph)
                  </label>
                  <input
                    type="number"
                    value={localWindSpeed}
                    onChange={(e) => setLocalWindSpeed(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    min="0"
                    max="50"
                  />
                  <p className="text-xs text-gray-600 mt-1">Set to your current real-life wind speed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wind Direction
                  </label>
                  <select
                    value={localWindDirection}
                    onChange={(e) => setLocalWindDirection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Headwind">Headwind (into you)</option>
                    <option value="Tailwind">Tailwind (behind you)</option>
                    <option value="Left-to-Right">Left-to-Right (crosswind)</option>
                    <option value="Right-to-Left">Right-to-Left (crosswind)</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Set to match your actual playing conditions</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveWindSettings}
              className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Save className="w-4 h-4" />
              Save Wind Settings
            </button>
          </div>
        </div>

        {bestRounds.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-800">Best Rounds</h2>
            </div>
            <div className="space-y-3">
              {bestRounds.map((round, index) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{round.total_score} strokes</div>
                      <div className="text-xs text-gray-600">
                        {new Date(round.created_at).toLocaleDateString()} • {round.hole_count} holes
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">My Bag</h2>
            <button
              onClick={() => setIsAddingClub(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Club
            </button>
          </div>

          {isAddingClub && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h3 className="font-semibold text-gray-800 mb-3">Add New Club</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      const type = e.target.value as ClubType;
                      setSelectedType(type);
                      setSelectedClub(CLUB_OPTIONS[type][0]);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {clubTypeOrder.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Club
                  </label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value as ClubName)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {CLUB_OPTIONS[selectedType].map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typical Yardage
                  </label>
                  <input
                    type="number"
                    value={yardage}
                    onChange={(e) => setYardage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddClub}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add Club
                  </button>
                  <button
                    onClick={() => setIsAddingClub(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {clubs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
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
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                      {type}s
                    </h3>
                    <div className="space-y-2">
                      {typeClubs.map(club => (
                        <div
                          key={club.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{club.club_name}</div>
                            <div className="text-sm text-gray-600">
                              {editingYardages[club.id] !== undefined ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="number"
                                    value={editingYardages[club.id]}
                                    onChange={(e) => setEditingYardages(prev => ({
                                      ...prev,
                                      [club.id]: e.target.value
                                    }))}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                    min="1"
                                  />
                                  <button
                                    onClick={() => handleUpdateYardage(club.id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingYardages(prev => {
                                      const updated = { ...prev };
                                      delete updated[club.id];
                                      return updated;
                                    })}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
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
                                  className="hover:text-green-600"
                                >
                                  {club.yardage} yards
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteClub(club.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </div>
  );
}
