export type DrillDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type DrillCategory = 'Putting' | 'Chipping' | 'Driving' | 'Irons' | 'Full Swing';

export interface Drill {
    id: string;
    title: string;
    description: string;
    difficulty: DrillDifficulty;
    category: DrillCategory;
    steps: string[];
    rating: number; // 0-5
}
