import { Round } from '../types/golf';

const OFFLINE_ROUND_KEY = 'offline_round_backup';
const OFFLINE_SHOTS_QUEUE_KEY = 'offline_shots_queue';

export interface OfflineShot {
  roundId: string;
  holeIndex: number;
  club: string;
  distance: number;
  direction: string;
  timestamp: number;
}

export const saveRoundOffline = (round: Round, roundId: string) => {
  try {
    const offlineData = {
      round,
      roundId,
      timestamp: Date.now(),
    };
    localStorage.setItem(OFFLINE_ROUND_KEY, JSON.stringify(offlineData));
  } catch (error) {
    console.error('Failed to save round offline:', error);
  }
};

export const getOfflineRound = (): { round: Round; roundId: string } | null => {
  try {
    const data = localStorage.getItem(OFFLINE_ROUND_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get offline round:', error);
    return null;
  }
};

export const clearOfflineRound = () => {
  try {
    localStorage.removeItem(OFFLINE_ROUND_KEY);
  } catch (error) {
    console.error('Failed to clear offline round:', error);
  }
};

export const queueOfflineShot = (shot: OfflineShot) => {
  try {
    const queue = getOfflineShotsQueue();
    queue.push(shot);
    localStorage.setItem(OFFLINE_SHOTS_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to queue offline shot:', error);
  }
};

export const getOfflineShotsQueue = (): OfflineShot[] => {
  try {
    const data = localStorage.getItem(OFFLINE_SHOTS_QUEUE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get offline shots queue:', error);
    return [];
  }
};

export const clearOfflineShotsQueue = () => {
  try {
    localStorage.removeItem(OFFLINE_SHOTS_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear offline shots queue:', error);
  }
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const syncOfflineData = async (
  onSyncShot: (shot: OfflineShot) => Promise<void>
): Promise<boolean> => {
  if (!isOnline()) {
    return false;
  }

  const queue = getOfflineShotsQueue();
  if (queue.length === 0) {
    return true;
  }

  try {
    for (const shot of queue) {
      await onSyncShot(shot);
    }
    clearOfflineShotsQueue();
    return true;
  } catch (error) {
    console.error('Failed to sync offline data:', error);
    return false;
  }
};
