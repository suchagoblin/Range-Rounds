import { useState, useEffect } from 'react';
import { useGolf } from '../context/GolfContext';
import { Users, Circle } from 'lucide-react';

interface ActiveParticipantsProps {
  courseId: string;
}

export default function ActiveParticipants({ courseId }: ActiveParticipantsProps) {
  const { getActiveParticipants, profile } = useGolf();
  const [participants, setParticipants] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadParticipants();
    const interval = setInterval(loadParticipants, 15000);
    return () => clearInterval(interval);
  }, [courseId]);

  const loadParticipants = async () => {
    const data = await getActiveParticipants(courseId);
    setParticipants(data);
  };

  if (participants.length === 0) return null;

  const otherParticipants = participants.filter(p => p.profileId !== profile?.id);
  const displayCount = otherParticipants.length;

  return (
    <div className="fixed top-4 right-4 z-20">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white rounded-xl shadow-lg p-3 cursor-pointer hover:shadow-xl transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-5 h-5 text-purple-600" />
            {displayCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{displayCount}</span>
              </div>
            )}
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {displayCount === 0 ? 'Playing Solo' : `${displayCount} ${displayCount === 1 ? 'Friend' : 'Friends'} Online`}
          </div>
        </div>

        {isExpanded && participants.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {participants.map((participant) => {
              const isCurrentUser = participant.profileId === profile?.id;
              const timeSinceActive = Date.now() - new Date(participant.lastActiveAt).getTime();
              const isActive = timeSinceActive < 2 * 60 * 1000;

              return (
                <div
                  key={participant.profileId}
                  className="flex items-center gap-2"
                >
                  <Circle
                    className={`w-2 h-2 ${isActive ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'}`}
                  />
                  <span className={`text-sm ${isCurrentUser ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
                    {participant.profileName}
                    {isCurrentUser && ' (You)'}
                  </span>
                </div>
              );
            })}
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
              Green dot = active in last 2 min
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
