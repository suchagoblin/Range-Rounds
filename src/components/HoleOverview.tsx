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
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 mb-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white">Hole Progress</h3>
        <p className="text-xs text-slate-500">{distanceCovered} of {hole.yardage} yards</p>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 relative h-16 bg-gradient-to-r from-slate-700 via-slate-600 to-emerald-900 rounded-lg border border-slate-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>

            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-amber-700 to-amber-600 flex items-center justify-center border-r border-amber-500">
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-sm"></div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-emerald-600 to-emerald-500 flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-400 fill-red-400" />
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
                    ? 'bg-blue-500 border-blue-400'
                    : 'bg-amber-600 border-amber-500'
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
                  <div className="golf-ball-inner flex items-center justify-center">
                    <div className="text-[5px] font-bold text-gray-600 leading-tight text-center uppercase tracking-tight" style={{ transform: 'rotate(-15deg)' }}>
                      range<br/>rounds
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-emerald-400 bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-700">{currentDistance}y</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-400 px-1 mt-3">
          <span className="font-semibold">Tee Box</span>
          {hole.hazard && hole.hazardType && (
            <span className="flex items-center gap-1">
              {hole.hazardType === 'Water' ? (
                <Droplet className="w-3 h-3 text-blue-400" />
              ) : (
                <Mountain className="w-3 h-3 text-amber-500" />
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
