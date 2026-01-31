import { useGolf } from '../context/GolfContext';
import { Flag } from 'lucide-react';

export default function PuttingScreen() {
  const { getCurrentHole, finishHole, undoLastShot } = useGolf();
  const currentHole = getCurrentHole();

  if (!currentHole) return null;

  const totalShots = currentHole.shots.reduce((sum, shot) => sum + 1 + shot.penaltyStrokes, 0);

  const handlePutts = (putts: number) => {
    finishHole(putts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-xl">
            <Flag className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">On the Green!</h1>
          <p className="text-green-100 text-lg">Hole {currentHole.number} • Par {currentHole.par}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-800 mb-2">{totalShots}</div>
            <div className="text-sm text-gray-500">Shots to Green</div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              How many putts?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePutts(0)}
                className="py-6 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                0
                <div className="text-xs font-normal mt-1">Chip In!</div>
              </button>
              <button
                onClick={() => handlePutts(1)}
                className="py-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                1
                <div className="text-xs font-normal mt-1">One Putt</div>
              </button>
              <button
                onClick={() => handlePutts(2)}
                className="py-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                2
                <div className="text-xs font-normal mt-1">Two Putt</div>
              </button>
            </div>
            <button
              onClick={() => handlePutts(3)}
              className="w-full mt-3 py-4 bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              3+ Putts
            </button>
          </div>
        </div>

        <button
          onClick={undoLastShot}
          className="w-full py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
        >
          Back to Adjust Last Shot
        </button>
      </div>
    </div>
  );
}
