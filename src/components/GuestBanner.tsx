import { Clock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GuestBannerProps {
  onSignUp: () => void;
}

export function GuestBanner({ onSignUp }: GuestBannerProps) {
  const { isGuest, guestTimeRemaining, logout } = useAuth();

  if (!isGuest) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-200 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            Guest mode - {guestTimeRemaining} min remaining. Data won't be saved.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSignUp}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus className="w-3 h-3" />
            Sign Up
          </button>
          <button
            onClick={logout}
            className="px-3 py-1 text-amber-300 hover:text-amber-200 text-sm font-medium transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
