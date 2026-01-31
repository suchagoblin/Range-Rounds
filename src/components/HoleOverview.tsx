import { Hole } from '../types/golf';
import { Flag } from 'lucide-react';

interface HoleOverviewProps {
  hole: Hole;
  currentDistance: number;
}

export default function HoleOverview({ hole, currentDistance }: HoleOverviewProps) {
  const progress = ((hole.yardage - currentDistance) / hole.yardage) * 100;
  const distanceCovered = hole.yardage - currentDistance;

  // Calculate hazard position (percentage along the hole)
  const getHazardPosition = () => {
    if (!hole.hazard) return null;
    // Position hazards based on location
    switch (hole.hazard) {
      case 'Front': return 75; // Near the green
      case 'Left': return 50;
      case 'Right': return 50;
      default: return 50;
    }
  };

  const hazardPos = getHazardPosition();

  // Distance markers based on hole length
  const getDistanceMarkers = () => {
    const markers = [];
    const step = hole.yardage > 400 ? 100 : hole.yardage > 200 ? 50 : 25;
    for (let d = step; d < hole.yardage; d += step) {
      const percent = (d / hole.yardage) * 100;
      if (percent > 10 && percent < 85) {
        markers.push({ distance: hole.yardage - d, percent });
      }
    }
    return markers;
  };

  const distanceMarkers = getDistanceMarkers();

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Hole Overview</h3>
          <p className="text-xs text-slate-500">{distanceCovered} of {hole.yardage} yards covered</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-400">{currentDistance}</span>
          <span className="text-xs text-slate-500 ml-1">yards to go</span>
        </div>
      </div>

      {/* Main hole visualization */}
      <div className="relative">
        <svg viewBox="0 0 400 80" className="w-full h-20 rounded-lg overflow-hidden">
          {/* Background - deep rough/trees */}
          <rect x="0" y="0" width="400" height="80" fill="#1a2e1a" />

          {/* Tree line pattern - top */}
          <g fill="#0d1f0d">
            {[...Array(20)].map((_, i) => (
              <ellipse key={`tree-top-${i}`} cx={i * 22 + 10} cy="8" rx="12" ry="10" />
            ))}
          </g>

          {/* Tree line pattern - bottom */}
          <g fill="#0d1f0d">
            {[...Array(20)].map((_, i) => (
              <ellipse key={`tree-bot-${i}`} cx={i * 22 + 10} cy="72" rx="12" ry="10" />
            ))}
          </g>

          {/* Light rough */}
          <rect x="0" y="15" width="400" height="50" fill="#2d4a2d" rx="2" />

          {/* Fairway */}
          <rect x="25" y="22" width="350" height="36" fill="#3d6b3d" rx="4" />

          {/* Fairway stripes (mowing pattern) */}
          <g fill="#4a7d4a" opacity="0.4">
            {[...Array(12)].map((_, i) => (
              <rect key={`stripe-${i}`} x={35 + i * 30} y="22" width="15" height="36" />
            ))}
          </g>

          {/* Tee box */}
          <g>
            <rect x="8" y="28" width="30" height="24" fill="#5a8a5a" rx="2" />
            <rect x="12" y="32" width="22" height="16" fill="#6b9b6b" rx="1" />
            {/* Tee markers */}
            <circle cx="18" cy="40" r="2" fill="#f59e0b" />
            <circle cx="28" cy="40" r="2" fill="#f59e0b" />
          </g>

          {/* Green */}
          <g>
            <ellipse cx="370" cy="40" rx="28" ry="22" fill="#4ade80" />
            <ellipse cx="370" cy="40" rx="22" ry="17" fill="#22c55e" />
            {/* Flag */}
            <line x1="372" y1="28" x2="372" y2="48" stroke="#dc2626" strokeWidth="1.5" />
            <polygon points="372,28 385,33 372,38" fill="#dc2626" />
            {/* Hole */}
            <circle cx="372" cy="40" r="2" fill="#1a1a1a" />
          </g>

          {/* Bunkers based on hazard data */}
          {hole.hazard && hole.hazardType === 'Bunker' && (
            <g>
              {hole.hazard === 'Front' && (
                <ellipse cx="330" cy="40" rx="15" ry="10" fill="#d4a574" stroke="#c4956a" strokeWidth="1" />
              )}
              {hole.hazard === 'Left' && (
                <ellipse cx="200" cy="20" rx="20" ry="8" fill="#d4a574" stroke="#c4956a" strokeWidth="1" />
              )}
              {hole.hazard === 'Right' && (
                <ellipse cx="200" cy="60" rx="20" ry="8" fill="#d4a574" stroke="#c4956a" strokeWidth="1" />
              )}
            </g>
          )}

          {/* Water hazard */}
          {hole.hazard && hole.hazardType === 'Water' && (
            <g>
              {hole.hazard === 'Front' && (
                <>
                  <ellipse cx="320" cy="40" rx="18" ry="12" fill="#1e40af" />
                  <ellipse cx="320" cy="38" rx="14" ry="8" fill="#3b82f6" opacity="0.5" />
                </>
              )}
              {hole.hazard === 'Left' && (
                <>
                  <ellipse cx="180" cy="18" rx="25" ry="10" fill="#1e40af" />
                  <ellipse cx="180" cy="16" rx="20" ry="6" fill="#3b82f6" opacity="0.5" />
                </>
              )}
              {hole.hazard === 'Right' && (
                <>
                  <ellipse cx="180" cy="62" rx="25" ry="10" fill="#1e40af" />
                  <ellipse cx="180" cy="60" rx="20" ry="6" fill="#3b82f6" opacity="0.5" />
                </>
              )}
            </g>
          )}

          {/* Distance markers */}
          {distanceMarkers.map((marker, i) => (
            <g key={`marker-${i}`}>
              <line
                x1={marker.percent * 3.5 + 25}
                y1="58"
                x2={marker.percent * 3.5 + 25}
                y2="62"
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={marker.percent * 3.5 + 25}
                y="70"
                fill="#94a3b8"
                fontSize="7"
                textAnchor="middle"
              >
                {marker.distance}
              </text>
            </g>
          ))}

          {/* Ball position */}
          <g transform={`translate(${Math.max(35, Math.min(340, progress * 3.1 + 35))}, 40)`}>
            {/* Ball shadow */}
            <ellipse cx="2" cy="4" rx="5" ry="2" fill="#000000" opacity="0.3" />
            {/* Ball */}
            <circle cx="0" cy="0" r="5" fill="#ffffff" />
            <circle cx="-1" cy="-1" r="4" fill="#f8f8f8" />
            {/* Dimples hint */}
            <circle cx="1" cy="-1" r="0.5" fill="#e5e5e5" />
            <circle cx="-1" cy="1" r="0.5" fill="#e5e5e5" />
            <circle cx="2" cy="1" r="0.5" fill="#e5e5e5" />
          </g>
        </svg>

        {/* Distance indicator below ball */}
        <div
          className="absolute -bottom-1 transition-all duration-500 ease-out"
          style={{ left: `${Math.max(8, Math.min(88, progress))}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-emerald-400">
            {currentDistance}y
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span>Tee</span>
        </div>
        {hole.hazard && hole.hazardType && (
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${hole.hazardType === 'Water' ? 'bg-blue-500' : 'bg-amber-600'}`}></div>
            <span>{hole.hazardType} ({hole.hazard})</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Flag className="w-3 h-3 text-red-500" />
          <span>Green</span>
        </div>
      </div>
    </div>
  );
}
