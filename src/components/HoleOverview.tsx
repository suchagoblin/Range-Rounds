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
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-900">Hole Progress</h3>
            <p className="text-xs text-gray-500">{distanceCovered} of {hole.yardage} yards</p>
          </div>

          {hole.hazard && hole.hazardType && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              {hole.hazardType === 'Water' ? (
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
              ) : (
                <Mountain className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="font-medium">{hole.hazardType} {hole.hazard}</span>
            </div>
          )}
        </div>

        <div className="relative w-20">
          <div className="relative h-64 bg-gradient-to-t from-amber-100 via-emerald-100 to-green-200 rounded-lg border border-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5"></div>

            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-emerald-600 to-emerald-500 flex items-center justify-center border-b border-emerald-700">
              <Flag className="w-6 h-6 text-red-500 fill-red-500" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-200 to-amber-300 flex items-center justify-center border-t border-amber-400">
              <div className="w-2 h-2 bg-amber-600 rounded-full shadow-sm"></div>
            </div>

            {hole.hazard && (
              <div
                className="absolute left-0 right-0 flex items-center justify-center z-5"
                style={{
                  bottom: hole.hazard === 'Front' ? '30%' : '50%',
                  transform: hole.hazard === 'Left' ? 'translateX(-150%)' : hole.hazard === 'Right' ? 'translateX(150%)' : 'none'
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
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out z-10 golf-ball-container"
              style={{ bottom: `${Math.max(8, Math.min(90, progress))}%` }}
            >
              <div className="relative">
                <div className="golf-ball">
                  <div className="golf-ball-inner flex items-center justify-center">
                    <div className="text-[5px] font-bold text-gray-600 leading-tight text-center uppercase tracking-tight" style={{ transform: 'rotate(-15deg)' }}>
                      range<br/>rounds
                    </div>
                  </div>
                </div>
                <div className="absolute -right-14 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">{currentDistance}y</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between text-xs text-gray-600 mt-2 text-center">
            <span className="font-semibold text-[10px] uppercase tracking-wide">Green</span>
            <div className="h-48"></div>
            <span className="font-semibold text-[10px] uppercase tracking-wide">Tee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
