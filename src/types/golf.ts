export type ClubName =
  | 'Driver' | '2 Wood' | '3 Wood' | '4 Wood' | '5 Wood' | '7 Wood'
  | '2 Hybrid' | '3 Hybrid' | '4 Hybrid' | '5 Hybrid'
  | '1 Iron' | '2 Iron' | '3 Iron' | '4 Iron' | '5 Iron' | '6 Iron' | '7 Iron' | '8 Iron' | '9 Iron'
  | 'Pitching Wedge' | 'Gap Wedge' | 'Sand Wedge' | 'Lob Wedge'
  | 'Putter';

export type ClubType = 'Driver' | 'Wood' | 'Hybrid' | 'Iron' | 'Wedge' | 'Putter';

export type Direction = 'Wide Left' | 'Left' | 'Middle' | 'Right' | 'Wide Right';
export type HazardLocation = 'Left' | 'Right' | 'Front' | null;
export type HazardType = 'Water' | 'Bunker' | null;

export interface Profile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ClubInBag {
  id: string;
  profile_id: string;
  club_type: ClubType;
  club_name: ClubName;
  yardage: number;
  created_at: string;
}

export interface Shot {
  id: string;
  club: ClubName;
  inputDistance: number;
  inputDirection: Direction;
  penaltyStrokes: number;
  finalDistance: number;
  remainingDistance: number;
  distancePenalty: number;
  hitHazard: boolean;
  wasMulligan?: boolean;
}

export interface Hole {
  id?: string;
  number: number;
  par: 3 | 4 | 5;
  yardage: number;
  hazard: HazardLocation;
  hazardType: HazardType;
  windSpeed: number;
  windDir: string;
  shots: Shot[];
  putts: number;
  isComplete: boolean;
}

export interface Round {
  id?: string;
  holes: Hole[];
  currentHoleIndex: number;
  isRoundComplete: boolean;
  profile?: Profile;
  clubs: ClubInBag[];
  mulligansAllowed: number;
  mulligansUsed: number;
  totalScore?: number;
  courseId?: string;
}

export type GameType = 'skins' | 'nassau' | 'stroke_play';

export interface Competition {
  id: string;
  round_id: string;
  game_type: GameType;
  bet_amount: number;
  results?: {
    winners?: Record<string, number>;
    payouts?: Record<string, number>;
    skins?: Record<number, string>;
  };
  created_at: string;
}

export interface BestRound {
  id: string;
  created_at: string;
  total_score: number;
  hole_count: number;
  course_id?: string;
}

export interface RoundSummary {
  id: string;
  hole_count: number;
  is_round_complete: boolean;
  created_at: string;
  holes: {
    par: number;
    putts: number;
    is_complete: boolean;
    shots: {
      penalty_strokes: number;
    }[];
  }[];
}

export interface SavedCourse {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  hole_count: number;
  is_shared: boolean;
  share_code?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  profileName: string;
  totalStrokes: number;
  totalPar: number;
  score: number;
  completedHoles: number;
  isComplete: boolean;
}

export interface ActiveParticipant {
  profileId: string;
  profileName: string;
  lastActiveAt: string;
}
