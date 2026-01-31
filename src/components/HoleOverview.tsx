import { Hole } from '../types/golf';
import { Droplet, Flag, Mountain } from 'lucide-react';

interface HoleOverviewProps {
  hole: Hole;
  currentDistance: number;
}

export default function HoleOverview({ hole, currentDistance }: HoleOverviewProps) {
  const progress = ((hole.yardage - currentDistance) / hole.yardage) * 100;
  const distanceCovered = hole.yardage - currentDistance;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900">Hole Progress</h3>
        <p className="text-xs text-gray-500">{distanceCovered} of {hole.yardage} yards</p>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 relative h-16 bg-gradient-to-r from-amber-100 via-emerald-100 to-green-200 rounded-lg border border-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>

            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-200 to-amber-300 flex items-center justify-center border-r border-amber-400">
              <div className="w-2 h-2 bg-amber-600 rounded-full shadow-sm"></div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-emerald-600 to-emerald-500 flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-500 fill-red-500" />
            </div>

            {hole.hazard && (
              <div
                className="absolute top-0 bottom-0 flex items-center justify-center"
                style={{
                  left: hole.hazard === 'Front' ? '70%' : hole.hazard === 'Left' ? '45%' : '45%',
                  transform: hole.hazard === 'Left' ? 'translateY(-150%)' : hole.hazard === 'Right' ? 'translateY(150%)' : 'none'
                }}
              >
                <div className={`rounded-full p-1.5 shadow-md border-2 ${
                  hole.hazardType === 'Water'
                    ? 'bg-blue-400 border-blue-200'
                    : 'bg-amber-500 border-amber-300'
                }`}>
                  {hole.hazardType === 'Water' ? (
                    <Droplet className="w-3 h-3 text-white" />
                  ) : (
                    <Mountain className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            )}

            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-10 golf-ball-container"
              style={{ left: `${Math.max(3, Math.min(92, progress))}%` }}
            >
              <div className="relative">
                <div className="golf-ball">
                  <div className="golf-ball-inner">
                    <div className="dimple" style={{ top: '15%', left: '25%' }}></div>
                    <div className="dimple" style={{ top: '15%', right: '25%' }}></div>
                    <div className="dimple" style={{ top: '15%', left: '50%', transform: 'translateX(-50%)' }}></div>
                    <div className="dimple" style={{ top: '35%', left: '15%' }}></div>
                    <div className="dimple" style={{ top: '35%', right: '15%' }}></div>
                    <div className="dimple" style={{ top: '35%', left: '40%' }}></div>
                    <div className="dimple" style={{ top: '35%', right: '40%' }}></div>
                    <div className="dimple" style={{ top: '50%', left: '30%' }}></div>
                    <div className="dimple" style={{ top: '50%', right: '30%' }}></div>
                    <div className="dimple" style={{ top: '50%', left: '50%', transform: 'translateX(-50%)' }}></div>
                    <div className="dimple" style={{ top: '65%', left: '15%' }}></div>
                    <div className="dimple" style={{ top: '65%', right: '15%' }}></div>
                    <div className="dimple" style={{ top: '65%', left: '40%' }}></div>
                    <div className="dimple" style={{ top: '65%', right: '40%' }}></div>
                    <div className="dimple" style={{ bottom: '15%', left: '25%' }}></div>
                    <div className="dimple" style={{ bottom: '15%', right: '25%' }}></div>
                    <div className="dimple" style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }}></div>
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">{currentDistance}y</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 px-1 mt-3">
          <span className="font-semibold">Tee Box</span>
          {hole.hazard && hole.hazardType && (
            <span className="flex items-center gap-1">
              {hole.hazardType === 'Water' ? (
                <Droplet className="w-3 h-3" />
              ) : (
                <Mountain className="w-3 h-3" />
              )}
              {hole.hazardType} {hole.hazard}
            </span>
          )}
          <span className="font-semibold">Green</span>
        </div>
      </div>
    </div>
  );
}
