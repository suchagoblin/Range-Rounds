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

  const handleAutoPutt = (putts: number) => {
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
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl border border-emerald-500 p-6 space-y-4 glow-green">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">On the Green!</h3>
          <p className="text-emerald-100 text-sm">How many putts to hole out?</p>
        </div>

        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Select number of putts">
          <button
            onClick={() => handleAutoPutt(1)}
            aria-label="1 Putt - Great Job"
            className="py-6 px-2 rounded-xl border border-emerald-300/30 bg-emerald-800/20 hover:bg-emerald-800/40 transition-all group"
          >
            <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">1</div>
            <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Putt</div>
            <div className="text-[10px] text-emerald-200/70 mt-1">Birdie Chance!</div>
          </button>

          <button
            onClick={() => handleAutoPutt(2)}
            aria-label="2 Putts - Good"
            className="py-6 px-2 rounded-xl border border-emerald-300/30 bg-emerald-800/20 hover:bg-emerald-800/40 transition-all group"
          >
            <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">2</div>
            <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Putts</div>
            <div className="text-[10px] text-emerald-200/70 mt-1">Standard</div>
          </button>

          <button
            onClick={() => handleAutoPutt(3)}
            aria-label="3 Putts - Tough Green"
            className="py-6 px-2 rounded-xl border border-emerald-300/30 bg-emerald-800/20 hover:bg-emerald-800/40 transition-all group"
          >
            <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">3</div>
            <div className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Putts</div>
            <div className="text-[10px] text-emerald-200/70 mt-1">Tough Lie</div>
          </button>
        </div>

        <div className="text-center text-xs text-emerald-100/60 mt-2">
          Be honest! Your putting average contributes to your stats.
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-6 text-center">
        <p className="text-amber-400 font-semibold mb-2">No clubs in your bag!</p>
        <p className="text-amber-300/80 text-sm">Go to Profile to add clubs and get personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 space-y-5">
      <fieldset>
        <legend className="block text-sm font-semibold text-white mb-3">
          Club Selection
          {selectedClub && getSuggestedClub(currentDistance) === selectedClub && (
            <span className="ml-2 text-xs text-emerald-400 font-normal">(Recommended)</span>
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
                  ? 'bg-emerald-500 text-white border border-emerald-400 glow-green-sm'
                  : getSuggestedClub(currentDistance) === club.club_name
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              <div>{club.club_name}</div>
              <div className="text-xs opacity-75">{club.yardage}y</div>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-semibold text-white mb-3">Direction</legend>
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
                  ? 'bg-blue-500 text-white border border-blue-400 glow-blue'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              {dir === 'Wide Left' ? 'W.L' : dir === 'Wide Right' ? 'W.R' : dir.charAt(0)}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="shot-distance" className="block text-sm font-semibold text-white mb-3">Distance (yards)</label>
        <input
          id="shot-distance"
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="Enter distance..."
          aria-describedby="distance-hint"
          className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-lg font-semibold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
        />
        <span id="distance-hint" className="sr-only">Enter the distance in yards for your shot</span>
      </div>

      <button
        onClick={handleSubmit}
        aria-label="Record shot with selected club and direction"
        className="w-full py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-base hover:shadow-lg transform hover:scale-[1.01] transition-all flex items-center justify-center gap-2 border border-emerald-400 glow-green animate-pulse-glow"
      >
        <Send className="w-5 h-5" aria-hidden="true" />
        Record Shot
      </button>
    </div>
  );
}
