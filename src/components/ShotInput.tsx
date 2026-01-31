import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { ClubName, Direction } from '../types/golf';
import { Send, Target } from 'lucide-react';
import { validateDistance } from '../utils/validation';
import { showToast } from '../utils/toast';

const DIRECTIONS: Direction[] = ['Wide Left', 'Left', 'Middle', 'Right', 'Wide Right'];

interface ShotInputProps {
  currentDistance: number;
}

export default function ShotInput({ currentDistance }: ShotInputProps) {
  const { recordShot, finishHole, clubs, getSuggestedClub } = useGolf();
  const [selectedClub, setSelectedClub] = useState<ClubName | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction>('Middle');
  const [distance, setDistance] = useState<string>('');
  const [isAutoPuttMode, setIsAutoPuttMode] = useState(false);

  useEffect(() => {
    if (currentDistance <= 10) {
      setIsAutoPuttMode(true);
    } else {
      setIsAutoPuttMode(false);
      const suggested = getSuggestedClub(currentDistance);
      if (suggested && !selectedClub) {
        setSelectedClub(suggested);
      }
    }
  }, [currentDistance, getSuggestedClub]);

  const handleAutoPutt = (direction: Direction) => {
    const putts = direction === 'Middle' ? 2 : 3;
    finishHole(putts);
  };

  const handleSubmit = async () => {
    if (!selectedClub) {
      showToast('Please select a club', 'error');
      return;
    }

    const dist = parseInt(distance);
    const validation = validateDistance(dist);
    if (!validation.valid) {
      showToast(validation.error || 'Invalid distance', 'error');
      return;
    }

    try {
      await recordShot(selectedClub, dist, selectedDirection);
      setDistance('');
      setSelectedDirection('Middle');
      showToast('Shot recorded', 'success');
    } catch (error) {
      showToast('Failed to record shot', 'error');
      console.error('Error recording shot:', error);
    }
  };

  if (isAutoPuttMode) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-sm border border-emerald-600 p-6 space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">On the Green!</h3>
          <p className="text-emerald-100 text-sm">Where did your putt end up?</p>
        </div>

        <div className="grid grid-cols-5 gap-2" role="group" aria-label="Putt direction options">
          {DIRECTIONS.map((dir) => (
            <button
              key={dir}
              onClick={() => handleAutoPutt(dir)}
              aria-label={`${dir} - ${dir === 'Middle' ? '2 putts' : '3 putts'}`}
              className={`py-4 px-1 rounded-xl font-bold text-xs transition-all shadow-sm ${
                dir === 'Middle'
                  ? 'bg-amber-400 text-gray-900 hover:bg-amber-300 border border-amber-500'
                  : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {dir === 'Wide Left' ? 'W.L' : dir === 'Wide Right' ? 'W.R' : dir.charAt(0)}
              <div className="text-xs mt-1 font-normal opacity-75">
                {dir === 'Middle' ? '+2' : '+3'}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-emerald-100 mt-2">
          Middle: 2 putts | Others: 3 putts
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-sm p-6 text-center">
        <p className="text-amber-900 font-semibold mb-2">No clubs in your bag!</p>
        <p className="text-amber-700 text-sm">Go to Profile to add clubs and get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-5">
      <fieldset>
        <legend className="block text-sm font-semibold text-gray-900 mb-3">
          Club Selection
          {selectedClub && getSuggestedClub(currentDistance) === selectedClub && (
            <span className="ml-2 text-xs text-emerald-600 font-normal">(Recommended)</span>
          )}
        </legend>
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto" role="radiogroup" aria-label="Select a club">
          {clubs.map((club) => (
            <button
              key={club.id}
              onClick={() => setSelectedClub(club.club_name)}
              role="radio"
              aria-checked={selectedClub === club.club_name}
              aria-label={`${club.club_name}, ${club.yardage} yards${getSuggestedClub(currentDistance) === club.club_name ? ', recommended' : ''}`}
              className={`py-2.5 px-2 rounded-xl font-semibold text-xs transition-all ${
                selectedClub === club.club_name
                  ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                  : getSuggestedClub(currentDistance) === club.club_name
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div>{club.club_name}</div>
              <div className="text-xs opacity-75">{club.yardage}y</div>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-semibold text-gray-900 mb-3">Direction</legend>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Shot direction">
          {DIRECTIONS.map((dir) => (
            <button
              key={dir}
              onClick={() => setSelectedDirection(dir)}
              role="radio"
              aria-checked={selectedDirection === dir}
              aria-label={dir}
              className={`py-3 px-1 rounded-xl font-medium text-xs transition-all ${
                selectedDirection === dir
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {dir === 'Wide Left' ? 'W.L' : dir === 'Wide Right' ? 'W.R' : dir.charAt(0)}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="shot-distance" className="block text-sm font-semibold text-gray-900 mb-3">Distance (yards)</label>
        <input
          id="shot-distance"
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="Enter distance..."
          aria-describedby="distance-hint"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-semibold text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition-all"
        />
        <span id="distance-hint" className="sr-only">Enter the distance in yards for your shot</span>
      </div>

      <button
        onClick={handleSubmit}
        aria-label="Record shot with selected club and direction"
        className="w-full py-4 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-semibold text-base shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all flex items-center justify-center gap-2 border border-emerald-600"
      >
        <Send className="w-5 h-5" aria-hidden="true" />
        Record Shot
      </button>
    </div>
  );
}
