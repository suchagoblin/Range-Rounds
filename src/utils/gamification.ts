import { RoundSummary } from '../types/golf';

export interface PlayerStats {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    progressPercent: number;
    totalHolesPlayed: number;
    totalBirdies: number;
    totalPars: number;
    bestStreak: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
}

export const ACHIEVEMENTS_LIST = [
    { id: 'first_birdie', title: 'First Birdie', description: 'Score your first birdie', icon: '🐦' },
    { id: 'eagle_eye', title: 'Eagle Eye', description: 'Score an eagle or better', icon: '🦅' },
    { id: 'long_drive', title: 'Power Hitter', description: 'Hit a drive over 300 yards', icon: '💪' },
    { id: 'consistency', title: 'Consistency is Key', description: 'Complete a round strictly with Pars or better', icon: '⚖️' },
    { id: 'marathon', title: 'Marathon Golfer', description: 'Play 50 total holes', icon: '🏃' },
    { id: 'sharpshooter', title: 'Sharpshooter', description: 'Hole out with 1 putt from 150+ yards approach', icon: '🎯' }, // Actually, we can just check for 1 putt on Par 4/5
    { id: 'streak_master', title: 'On Fire', description: 'Get a birdie streak of 3 or more', icon: '🔥' },
];

export function calculatePlayerStats(rounds: RoundSummary[]): PlayerStats & { achievements: Achievement[] } {
    let totalXp = 0;
    let totalHolesPlayed = 0;
    let totalBirdies = 0;
    let totalPars = 0;
    let totalEagles = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let maxDrive = 0;

    // Achievement tracking
    let hasBirdie = false;
    let hasEagle = false;
    let has300YardDrive = false;
    let hasCleanRound = false;
    let hasStreak3 = false;

    rounds.forEach((round) => {
        if (round.is_round_complete) {
            totalXp += XP_PER_ROUND;

            // Check for clean round (only if 9 or 18 holes)
            if (round.hole_count >= 9) {
                const roundScores = round.holes
                    .filter(h => h.is_complete)
                    .map(h => {
                        const shotStrokes = h.shots.reduce((sum, shot) => sum + 1 + shot.penalty_strokes, 0);
                        return (shotStrokes + h.putts) - h.par;
                    });

                if (roundScores.length > 0 && roundScores.every(score => score <= 0)) {
                    hasCleanRound = true;
                }
            }
        }

        round.holes.forEach((hole) => {
            if (!hole.is_complete) return;

            totalHolesPlayed++;
            totalXp += XP_PER_HOLE;

            // Check shots for stats
            hole.shots.forEach(shot => {
                if (shot.club === 'Driver' && shot.final_distance > 300) {
                    has300YardDrive = true;
                }
                if (shot.club === 'Driver' && shot.final_distance > maxDrive) {
                    maxDrive = shot.final_distance;
                }
            });

            // Calculate score
            const shotStrokes = hole.shots.reduce((sum, shot) => sum + 1 + shot.penalty_strokes, 0);
            const totalStrokes = shotStrokes + hole.putts;
            const score = totalStrokes - hole.par;

            if (score <= 0) {
                // Streak continues for Par or better? Usually birdie streak.
                // Let's count "good score" streak? Or just Birdie streak?
                // Common convention: Birdie streak involves Birdies or better.
                if (score < 0) {
                    currentStreak++; // Birdie streak
                } else {
                    currentStreak = 0; // Reset on Par
                }

                if (currentStreak > bestStreak) bestStreak = currentStreak;
                if (currentStreak >= 3) hasStreak3 = true;

            } else {
                currentStreak = 0;
            }

            if (score === 0) {
                totalPars++;
                totalXp += XP_BONUS_PAR;
            } else if (score === -1) {
                totalBirdies++;
                totalXp += XP_BONUS_BIRDIE;
                hasBirdie = true;
            } else if (score <= -2) {
                totalEagles++;
                totalBirdies++; // Count eagles as birdies for generic stats
                totalXp += XP_BONUS_EAGLE;
                hasBirdie = true; // Technically yes
                hasEagle = true;
            }
        });
    });

    // Level calculation: lvl = sqrt(XP / 100) approx, or simple tiers
    // Level 1: 0-1000
    // Level 2: 1000-2500
    // Scaling: Level * 1000 base?

    let level = 1;
    let xpForNext = 1000;
    let xpThreshold = 0;

    // Simple quadratic curve
    while (totalXp >= xpThreshold + xpForNext) {
        xpThreshold += xpForNext;
        level++;
        xpForNext = Math.floor(xpForNext * 1.2);
    }

    const currentLevelXp = totalXp - xpThreshold;
    const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpForNext) * 100));

    // Calculate achievements state
    const achievements: Achievement[] = ACHIEVEMENTS_LIST.map(ach => {
        let unlocked = false;
        switch (ach.id) {
            case 'first_birdie': unlocked = hasBirdie; break;
            case 'eagle_eye': unlocked = hasEagle; break;
            case 'long_drive': unlocked = has300YardDrive; break;
            case 'consistency': unlocked = hasCleanRound; break;
            case 'marathon': unlocked = totalHolesPlayed >= 50; break;
            case 'streak_master': unlocked = hasStreak3; break;
            case 'sharpshooter': unlocked = false; break; // Placeholder for now
        }
        return { ...ach, unlocked };
    });

    return {
        level,
        currentXp: currentLevelXp,
        nextLevelXp: xpForNext,
        progressPercent,
        totalHolesPlayed,
        totalBirdies,
        totalPars,
        bestStreak,
        achievements
    };
}
