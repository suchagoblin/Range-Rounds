import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Round, Hole, Shot, ClubName, Direction, Profile, ClubInBag, ClubType, BestRound, GameType, Competition } from '../types/golf';
import { generateHole, calculateShotResult, generateHoles } from '../utils/golfLogic';
import { supabase } from '../lib/supabase';

interface GolfContextType {
  round: Round | null;
  profile: Profile | null;
  clubs: ClubInBag[];
  currentRoundId: string | null;
  startRound: (holeCount: 3 | 9 | 18, courseId?: string, mulligansAllowed?: number) => Promise<void>;
  recordShot: (club: ClubName, distance: number, direction: Direction) => Promise<void>;
  finishHole: (putts: number) => Promise<void>;
  skipHole: () => Promise<void>;
  undoLastShot: () => Promise<void>;
  useMulligan: () => Promise<void>;
  getCurrentHole: () => Hole | null;
  getHoleStats: (holeIndex: number) => HoleStats;
  getRoundStats: () => RoundStats;
  updateProfile: (name: string) => Promise<void>;
  addClub: (clubType: ClubType, clubName: ClubName, yardage: number) => Promise<void>;
  updateClub: (clubId: string, yardage: number) => Promise<void>;
  deleteClub: (clubId: string) => Promise<void>;
  getSuggestedClub: (distance: number) => ClubName | null;
  loadRound: (roundId: string) => Promise<void>;
  getPastRounds: () => Promise<any[]>;
  getBestRounds: (limit?: number) => Promise<BestRound[]>;
  saveCurrentCourse: (name: string, description?: string) => Promise<string | null>;
  getSavedCourses: () => Promise<any[]>;
  deleteCourse: (courseId: string) => Promise<void>;
  shareCourse: (courseId: string) => Promise<string | null>;
  joinSharedCourse: (shareCode: string) => Promise<string | null>;
  getCourseLeaderboard: (courseId: string) => Promise<any[]>;
  getActiveParticipants: (courseId: string) => Promise<any[]>;
  updateParticipantActivity: (courseId: string) => Promise<void>;
  addCompetition: (gameType: GameType, betAmount: number) => Promise<void>;
  getCompetition: () => Promise<Competition | null>;
  currentCourseId: string | null;
}

export interface HoleStats {
  strokes: number;
  score: number;
  scoreName: string;
}

export interface RoundStats {
  totalStrokes: number;
  totalPar: number;
  score: number;
  completedHoles: number;
}

const GolfContext = createContext<GolfContextType | undefined>(undefined);

export function GolfProvider({ children }: { children: ReactNode }) {
  const [round, setRound] = useState<Round | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clubs, setClubs] = useState<ClubInBag[]>([]);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const createDefaultClubs = async (profileId: string) => {
    const defaultClubs = [
      { type: 'Driver' as ClubType, name: 'Driver' as ClubName, yardage: 230 },
      { type: 'Wood' as ClubType, name: '3 Wood' as ClubName, yardage: 210 },
      { type: 'Hybrid' as ClubType, name: '3 Hybrid' as ClubName, yardage: 190 },
      { type: 'Iron' as ClubType, name: '4 Iron' as ClubName, yardage: 180 },
      { type: 'Iron' as ClubType, name: '5 Iron' as ClubName, yardage: 170 },
      { type: 'Iron' as ClubType, name: '6 Iron' as ClubName, yardage: 160 },
      { type: 'Iron' as ClubType, name: '7 Iron' as ClubName, yardage: 150 },
      { type: 'Iron' as ClubType, name: '8 Iron' as ClubName, yardage: 140 },
      { type: 'Iron' as ClubType, name: '9 Iron' as ClubName, yardage: 130 },
      { type: 'Wedge' as ClubType, name: 'Pitching Wedge' as ClubName, yardage: 120 },
      { type: 'Wedge' as ClubType, name: 'Sand Wedge' as ClubName, yardage: 100 },
      { type: 'Wedge' as ClubType, name: 'Lob Wedge' as ClubName, yardage: 80 },
      { type: 'Putter' as ClubType, name: 'Putter' as ClubName, yardage: 0 }
    ];

    const clubsToInsert = defaultClubs.map(club => ({
      profile_id: profileId,
      club_type: club.type,
      club_name: club.name,
      yardage: club.yardage
    }));

    const { data } = await supabase
      .from('clubs')
      .insert(clubsToInsert)
      .select();

    return data || [];
  };

  const loadProfile = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (profiles && profiles.length > 0) {
      const loadedProfile = profiles[0];
      setProfile(loadedProfile);

      const { data: clubsData } = await supabase
        .from('clubs')
        .select('*')
        .eq('profile_id', loadedProfile.id)
        .order('created_at', { ascending: true });

      if (clubsData && clubsData.length > 0) {
        setClubs(clubsData);
      } else {
        const defaultClubs = await createDefaultClubs(loadedProfile.id);
        setClubs(defaultClubs);
      }
    } else {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ name: 'Golfer' })
        .select()
        .single();

      if (newProfile) {
        setProfile(newProfile);
        const defaultClubs = await createDefaultClubs(newProfile.id);
        setClubs(defaultClubs);
      }
    }
  };

  const updateProfile = async (name: string) => {
    if (!profile) return;

    const { data } = await supabase
      .from('profiles')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const addClub = async (clubType: ClubType, clubName: ClubName, yardage: number) => {
    if (!profile) return;

    const { data } = await supabase
      .from('clubs')
      .insert({
        profile_id: profile.id,
        club_type: clubType,
        club_name: clubName,
        yardage
      })
      .select()
      .single();

    if (data) {
      setClubs([...clubs, data]);
    }
  };

  const updateClub = async (clubId: string, yardage: number) => {
    const { data } = await supabase
      .from('clubs')
      .update({ yardage })
      .eq('id', clubId)
      .select()
      .single();

    if (data) {
      setClubs(clubs.map(club => club.id === clubId ? data : club));
    }
  };

  const deleteClub = async (clubId: string) => {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId);

    if (!error) {
      setClubs(clubs.filter(club => club.id !== clubId));
    }
  };

  const getSuggestedClub = (distance: number): ClubName | null => {
    if (clubs.length === 0) return null;

    const sortedClubs = [...clubs].sort((a, b) => b.yardage - a.yardage);

    for (const club of sortedClubs) {
      if (distance >= club.yardage * 0.9) {
        return club.club_name;
      }
    }

    return sortedClubs[sortedClubs.length - 1]?.club_name || null;
  };

  const startRound = async (holeCount: 3 | 9 | 18, courseId?: string, mulligansAllowed: number = 2) => {
    if (!profile) return;

    let holes: Hole[] = [];

    if (courseId) {
      const { data: courseHoles } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number', { ascending: true });

      if (courseHoles) {
        holes = courseHoles.map((hole) => ({
          number: hole.hole_number,
          par: hole.par as 3 | 4 | 5,
          yardage: hole.yardage,
          hazard: hole.hazard as any,
          hazardType: hole.hazard_type as any,
          windSpeed: hole.wind_speed,
          windDir: hole.wind_dir,
          shots: [],
          putts: 0,
          isComplete: false,
        }));
        setCurrentCourseId(courseId);
      }
    } else {
      holes = generateHoles(holeCount);
      setCurrentCourseId(null);
    }

    const { data: newRound } = await supabase
      .from('rounds')
      .insert({
        profile_id: profile.id,
        hole_count: holes.length,
        current_hole_index: 0,
        is_round_complete: false,
        mulligans_allowed: mulligansAllowed,
        mulligans_used: 0,
        course_id: courseId || null,
      })
      .select()
      .single();

    if (newRound) {
      setCurrentRoundId(newRound.id);

      const holesData = holes.map((hole) => ({
        round_id: newRound.id,
        hole_number: hole.number,
        par: hole.par,
        yardage: hole.yardage,
        hazard: hole.hazard,
        hazard_type: hole.hazardType,
        wind_speed: hole.windSpeed,
        wind_dir: hole.windDir,
        putts: 0,
        is_complete: false,
      }));

      await supabase.from('holes').insert(holesData);

      if (courseId) {
        await supabase
          .from('course_participants')
          .upsert({
            course_id: courseId,
            profile_id: profile.id,
            round_id: newRound.id,
            last_active_at: new Date().toISOString(),
          });
      }

      setRound({
        id: newRound.id,
        holes,
        currentHoleIndex: 0,
        isRoundComplete: false,
        profile: profile || undefined,
        clubs,
        mulligansAllowed,
        mulligansUsed: 0,
        courseId: courseId,
      });
    }
  };

  const getCurrentHole = (): Hole | null => {
    if (!round) return null;
    return round.holes[round.currentHoleIndex];
  };

  const recordShot = async (club: ClubName, distance: number, direction: Direction) => {
    if (!round || !currentRoundId) return;
    const currentHole = getCurrentHole();
    if (!currentHole || currentHole.isComplete) return;

    const currentDistance = currentHole.shots.length === 0
      ? currentHole.yardage
      : currentHole.shots[currentHole.shots.length - 1].remainingDistance;

    const shotResult = calculateShotResult(
      distance,
      direction,
      currentDistance,
      currentHole.hazard,
      currentHole.hazardType,
      currentHole.windSpeed,
      currentHole.windDir
    );

    const newShot: Shot = {
      id: `${Date.now()}-${Math.random()}`,
      club,
      inputDistance: distance,
      inputDirection: direction,
      penaltyStrokes: shotResult.penaltyStrokes,
      finalDistance: shotResult.finalDistance,
      remainingDistance: shotResult.remainingDistance,
      distancePenalty: shotResult.distancePenalty,
      hitHazard: shotResult.hitHazard,
    };

    const { data: holesData } = await supabase
      .from('holes')
      .select('id')
      .eq('round_id', currentRoundId)
      .eq('hole_number', currentHole.number)
      .single();

    if (holesData) {
      await supabase.from('shots').insert({
        hole_id: holesData.id,
        shot_order: currentHole.shots.length,
        club,
        input_distance: distance,
        input_direction: direction,
        penalty_strokes: shotResult.penaltyStrokes,
        final_distance: shotResult.finalDistance,
        remaining_distance: shotResult.remainingDistance,
        distance_penalty: shotResult.distancePenalty,
        hit_hazard: shotResult.hitHazard,
      });
    }

    setRound({
      ...round,
      holes: round.holes.map((hole, idx) =>
        idx === round.currentHoleIndex
          ? { ...hole, shots: [...hole.shots, newShot] }
          : hole
      ),
    });
  };

  const undoLastShot = async () => {
    if (!round || !currentRoundId) return;
    const currentHole = getCurrentHole();
    if (!currentHole || currentHole.shots.length === 0 || currentHole.isComplete) return;

    const { data: holesData } = await supabase
      .from('holes')
      .select('id')
      .eq('round_id', currentRoundId)
      .eq('hole_number', currentHole.number)
      .single();

    if (holesData) {
      const { data: shots } = await supabase
        .from('shots')
        .select('id')
        .eq('hole_id', holesData.id)
        .order('shot_order', { ascending: false })
        .limit(1);

      if (shots && shots.length > 0) {
        await supabase.from('shots').delete().eq('id', shots[0].id);
      }
    }

    setRound({
      ...round,
      holes: round.holes.map((hole, idx) =>
        idx === round.currentHoleIndex
          ? { ...hole, shots: hole.shots.slice(0, -1) }
          : hole
      ),
    });
  };

  const useMulligan = async () => {
    if (!round || !currentRoundId) return;
    if (round.mulligansUsed >= round.mulligansAllowed) return;

    const currentHole = getCurrentHole();
    if (!currentHole || currentHole.shots.length === 0 || currentHole.isComplete) return;

    const { data: holesData } = await supabase
      .from('holes')
      .select('id')
      .eq('round_id', currentRoundId)
      .eq('hole_number', currentHole.number)
      .single();

    if (holesData) {
      const lastShotOrder = currentHole.shots.length - 1;

      await supabase.from('hole_mulligans').insert({
        hole_id: holesData.id,
        shot_order: lastShotOrder,
      });

      const { data: shots } = await supabase
        .from('shots')
        .select('id')
        .eq('hole_id', holesData.id)
        .order('shot_order', { ascending: false })
        .limit(1);

      if (shots && shots.length > 0) {
        await supabase.from('shots').delete().eq('id', shots[0].id);
      }
    }

    await supabase
      .from('rounds')
      .update({ mulligans_used: round.mulligansUsed + 1 })
      .eq('id', currentRoundId);

    setRound({
      ...round,
      mulligansUsed: round.mulligansUsed + 1,
      holes: round.holes.map((hole, idx) =>
        idx === round.currentHoleIndex
          ? { ...hole, shots: hole.shots.slice(0, -1) }
          : hole
      ),
    });
  };

  const finishHole = async (putts: number) => {
    if (!round || !currentRoundId) return;
    const currentHole = getCurrentHole();
    if (!currentHole || currentHole.isComplete) return;

    const { data: holesData } = await supabase
      .from('holes')
      .select('id')
      .eq('round_id', currentRoundId)
      .eq('hole_number', currentHole.number)
      .single();

    if (holesData) {
      await supabase
        .from('holes')
        .update({ putts, is_complete: true })
        .eq('id', holesData.id);
    }

    const updatedHoles = round.holes.map((hole, idx) =>
      idx === round.currentHoleIndex
        ? { ...hole, putts, isComplete: true }
        : hole
    );

    const nextHoleIndex = round.currentHoleIndex + 1;
    const isRoundComplete = nextHoleIndex >= round.holes.length;

    let totalScore: number | undefined;
    if (isRoundComplete) {
      let totalStrokes = 0;
      let totalPar = 0;
      updatedHoles.forEach((hole) => {
        if (hole.isComplete) {
          const shotStrokes = hole.shots.reduce((sum, shot) => sum + 1 + shot.penaltyStrokes, 0);
          totalStrokes += shotStrokes + hole.putts;
          totalPar += hole.par;
        }
      });
      totalScore = totalStrokes;
    }

    await supabase
      .from('rounds')
      .update({
        current_hole_index: isRoundComplete ? round.currentHoleIndex : nextHoleIndex,
        is_round_complete: isRoundComplete,
        total_score: totalScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentRoundId);

    setRound({
      ...round,
      holes: updatedHoles,
      currentHoleIndex: isRoundComplete ? round.currentHoleIndex : nextHoleIndex,
      isRoundComplete,
      totalScore,
    });
  };

  const skipHole = async () => {
    if (!round || !currentRoundId) return;
    const currentHole = getCurrentHole();
    if (!currentHole || currentHole.isComplete) return;

    const nextHoleIndex = round.currentHoleIndex + 1;
    const isRoundComplete = nextHoleIndex >= round.holes.length;

    await supabase
      .from('rounds')
      .update({
        current_hole_index: isRoundComplete ? round.currentHoleIndex : nextHoleIndex,
        is_round_complete: isRoundComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentRoundId);

    setRound({
      ...round,
      currentHoleIndex: isRoundComplete ? round.currentHoleIndex : nextHoleIndex,
      isRoundComplete,
    });
  };

  const getHoleStats = (holeIndex: number): HoleStats => {
    if (!round || holeIndex >= round.holes.length) {
      return { strokes: 0, score: 0, scoreName: '-' };
    }

    const hole = round.holes[holeIndex];
    if (!hole.isComplete) {
      return { strokes: 0, score: 0, scoreName: '-' };
    }

    const shotStrokes = hole.shots.reduce((sum, shot) => sum + 1 + shot.penaltyStrokes, 0);
    const totalStrokes = shotStrokes + hole.putts;
    const score = totalStrokes - hole.par;

    const scoreName = getScoreName(score);

    return { strokes: totalStrokes, score, scoreName };
  };

  const getRoundStats = (): RoundStats => {
    if (!round) {
      return { totalStrokes: 0, totalPar: 0, score: 0, completedHoles: 0 };
    }

    let totalStrokes = 0;
    let totalPar = 0;
    let completedHoles = 0;

    round.holes.forEach((hole, idx) => {
      if (hole.isComplete) {
        const stats = getHoleStats(idx);
        totalStrokes += stats.strokes;
        totalPar += hole.par;
        completedHoles++;
      }
    });

    return {
      totalStrokes,
      totalPar,
      score: totalStrokes - totalPar,
      completedHoles,
    };
  };

  const loadRound = async (roundId: string) => {
    const { data: roundData } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (!roundData) return;

    const { data: holesData } = await supabase
      .from('holes')
      .select('*')
      .eq('round_id', roundId)
      .order('hole_number', { ascending: true });

    if (!holesData) return;

    const holes: Hole[] = [];
    for (const holeData of holesData) {
      const { data: shotsData } = await supabase
        .from('shots')
        .select('*')
        .eq('hole_id', holeData.id)
        .order('shot_order', { ascending: true });

      const shots: Shot[] = (shotsData || []).map((shot) => ({
        id: shot.id,
        club: shot.club as ClubName,
        inputDistance: shot.input_distance,
        inputDirection: shot.input_direction as Direction,
        penaltyStrokes: shot.penalty_strokes,
        finalDistance: shot.final_distance,
        remainingDistance: shot.remaining_distance,
        distancePenalty: shot.distance_penalty,
        hitHazard: shot.hit_hazard,
      }));

      holes.push({
        id: holeData.id,
        number: holeData.hole_number,
        par: holeData.par as 3 | 4 | 5,
        yardage: holeData.yardage,
        hazard: holeData.hazard as any,
        hazardType: holeData.hazard_type as any,
        windSpeed: holeData.wind_speed,
        windDir: holeData.wind_dir,
        shots,
        putts: holeData.putts,
        isComplete: holeData.is_complete,
      });
    }

    setCurrentRoundId(roundId);
    setCurrentCourseId(roundData.course_id || null);
    setRound({
      id: roundId,
      holes,
      currentHoleIndex: roundData.current_hole_index,
      isRoundComplete: roundData.is_round_complete,
      profile: profile || undefined,
      clubs,
      mulligansAllowed: roundData.mulligans_allowed || 2,
      mulligansUsed: roundData.mulligans_used || 0,
      totalScore: roundData.total_score,
      courseId: roundData.course_id,
    });
  };

  const getPastRounds = async () => {
    if (!profile) return [];

    const { data: rounds } = await supabase
      .from('rounds')
      .select(`
        id,
        hole_count,
        is_round_complete,
        created_at,
        holes (
          par,
          putts,
          is_complete,
          shots (
            penalty_strokes
          )
        )
      `)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    return rounds || [];
  };

  const getBestRounds = async (limit: number = 5): Promise<BestRound[]> => {
    if (!profile) return [];

    const { data: rounds } = await supabase
      .from('rounds')
      .select('id, created_at, total_score, hole_count, course_id')
      .eq('profile_id', profile.id)
      .eq('is_round_complete', true)
      .not('total_score', 'is', null)
      .order('total_score', { ascending: true })
      .limit(limit);

    return rounds || [];
  };

  const addCompetition = async (gameType: GameType, betAmount: number) => {
    if (!currentRoundId) return;

    await supabase.from('competitions').insert({
      round_id: currentRoundId,
      game_type: gameType,
      bet_amount: betAmount,
    });
  };

  const getCompetition = async (): Promise<Competition | null> => {
    if (!currentRoundId) return null;

    const { data } = await supabase
      .from('competitions')
      .select('*')
      .eq('round_id', currentRoundId)
      .maybeSingle();

    return data;
  };

  const saveCurrentCourse = async (name: string, description?: string): Promise<string | null> => {
    if (!profile || !round) return null;

    const { data: course } = await supabase
      .from('courses')
      .insert({
        profile_id: profile.id,
        name,
        description,
        hole_count: round.holes.length,
        is_shared: false,
      })
      .select()
      .single();

    if (course) {
      const courseHolesData = round.holes.map((hole) => ({
        course_id: course.id,
        hole_number: hole.number,
        par: hole.par,
        yardage: hole.yardage,
        hazard: hole.hazard,
        hazard_type: hole.hazardType,
        wind_speed: hole.windSpeed,
        wind_dir: hole.windDir,
      }));

      await supabase.from('course_holes').insert(courseHolesData);
      return course.id;
    }

    return null;
  };

  const getSavedCourses = async () => {
    if (!profile) return [];

    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    return courses || [];
  };

  const deleteCourse = async (courseId: string) => {
    await supabase.from('courses').delete().eq('id', courseId);
  };

  const shareCourse = async (courseId: string): Promise<string | null> => {
    if (!profile) return null;

    const { data } = await supabase.rpc('generate_share_code').single();
    const shareCode = data as string;

    const { data: course } = await supabase
      .from('courses')
      .update({
        is_shared: true,
        share_code: shareCode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select()
      .single();

    if (course) {
      await supabase.from('course_participants').insert({
        course_id: courseId,
        profile_id: profile.id,
        last_active_at: new Date().toISOString(),
      });

      return shareCode;
    }

    return null;
  };

  const joinSharedCourse = async (shareCode: string): Promise<string | null> => {
    if (!profile) return null;

    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('share_code', shareCode)
      .eq('is_shared', true)
      .single();

    if (course) {
      await supabase.from('course_participants').insert({
        course_id: course.id,
        profile_id: profile.id,
        last_active_at: new Date().toISOString(),
      });

      return course.id;
    }

    return null;
  };

  const getCourseLeaderboard = async (courseId: string) => {
    const { data: participants } = await supabase
      .from('course_participants')
      .select(`
        profile_id,
        round_id,
        profiles (
          name
        ),
        rounds (
          is_round_complete,
          holes (
            par,
            putts,
            is_complete,
            shots (
              penalty_strokes
            )
          )
        )
      `)
      .eq('course_id', courseId)
      .not('round_id', 'is', null);

    if (!participants) return [];

    return participants.map((p: any) => {
      let totalStrokes = 0;
      let totalPar = 0;
      let completedHoles = 0;

      if (p.rounds && p.rounds.holes) {
        p.rounds.holes.forEach((hole: any) => {
          if (hole.is_complete) {
            const shotStrokes = hole.shots.reduce((sum: number, shot: any) => sum + 1 + shot.penalty_strokes, 0);
            totalStrokes += shotStrokes + hole.putts;
            totalPar += hole.par;
            completedHoles++;
          }
        });
      }

      return {
        profileName: p.profiles?.name || 'Unknown',
        totalStrokes,
        totalPar,
        score: totalStrokes - totalPar,
        completedHoles,
        isComplete: p.rounds?.is_round_complete || false,
      };
    }).sort((a: any, b: any) => {
      if (a.completedHoles !== b.completedHoles) {
        return b.completedHoles - a.completedHoles;
      }
      return a.score - b.score;
    });
  };

  const getActiveParticipants = async (courseId: string) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: participants } = await supabase
      .from('course_participants')
      .select(`
        profile_id,
        last_active_at,
        profiles (
          name
        )
      `)
      .eq('course_id', courseId)
      .gte('last_active_at', fiveMinutesAgo)
      .order('last_active_at', { ascending: false });

    if (!participants) return [];

    return participants.map((p: any) => ({
      profileId: p.profile_id,
      profileName: p.profiles?.name || 'Unknown',
      lastActiveAt: p.last_active_at,
    }));
  };

  const updateParticipantActivity = async (courseId: string) => {
    if (!profile) return;

    await supabase
      .from('course_participants')
      .upsert({
        course_id: courseId,
        profile_id: profile.id,
        last_active_at: new Date().toISOString(),
      }, {
        onConflict: 'course_id,profile_id'
      });
  };

  useEffect(() => {
    if (!currentCourseId || !profile) return;

    updateParticipantActivity(currentCourseId);

    const interval = setInterval(() => {
      updateParticipantActivity(currentCourseId);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentCourseId, profile]);

  return (
    <GolfContext.Provider
      value={{
        round,
        profile,
        clubs,
        currentRoundId,
        currentCourseId,
        startRound,
        recordShot,
        finishHole,
        skipHole,
        undoLastShot,
        useMulligan,
        getCurrentHole,
        getHoleStats,
        getRoundStats,
        updateProfile,
        addClub,
        updateClub,
        deleteClub,
        getSuggestedClub,
        loadRound,
        getPastRounds,
        getBestRounds,
        saveCurrentCourse,
        getSavedCourses,
        deleteCourse,
        shareCourse,
        joinSharedCourse,
        getCourseLeaderboard,
        getActiveParticipants,
        updateParticipantActivity,
        addCompetition,
        getCompetition,
      }}
    >
      {children}
    </GolfContext.Provider>
  );
}

export function useGolf() {
  const context = useContext(GolfContext);
  if (context === undefined) {
    throw new Error('useGolf must be used within a GolfProvider');
  }
  return context;
}

function getScoreName(score: number): string {
  if (score <= -3) return 'Albatross';
  if (score === -2) return 'Eagle';
  if (score === -1) return 'Birdie';
  if (score === 0) return 'Par';
  if (score === 1) return 'Bogey';
  if (score === 2) return 'Double';
  return `+${score}`;
}
