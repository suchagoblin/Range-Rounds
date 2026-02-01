import { useState, useEffect } from 'react';
import { DRILLS_DATA } from '../utils/drillsData';

export interface DrillProgress {
    ratings: Record<string, number>;
    completions: Record<string, boolean>;
    notes: Record<string, string>;
}

export function useDrillProgress() {
    const [progress, setProgress] = useState<DrillProgress>({
        ratings: {},
        completions: {},
        notes: {}
    });
    const [loading, setLoading] = useState(true);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('drill-progress');
            if (stored) {
                setProgress(JSON.parse(stored));
            } else {
                // Migration: Check for legacy individual rating keys
                const newRatings: Record<string, number> = {};
                DRILLS_DATA.forEach(drill => {
                    const legacyRating = localStorage.getItem(`drill-rating-${drill.id}`);
                    if (legacyRating) {
                        newRatings[drill.id] = parseInt(legacyRating);
                        // Optional: clean up legacy keys
                        // localStorage.removeItem(`drill-rating-${drill.id}`);
                    }
                });

                if (Object.keys(newRatings).length > 0) {
                    setProgress(prev => ({ ...prev, ratings: newRatings }));
                }
            }
        } catch (e) {
            console.error('Failed to load drill progress', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save to local storage whenever progress changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('drill-progress', JSON.stringify(progress));
        }
    }, [progress, loading]);

    const toggleComplete = (drillId: string) => {
        setProgress(prev => ({
            ...prev,
            completions: {
                ...prev.completions,
                [drillId]: !prev.completions[drillId]
            }
        }));
    };

    const rateDrill = (drillId: string, rating: number) => {
        setProgress(prev => ({
            ...prev,
            ratings: {
                ...prev.ratings,
                [drillId]: rating
            }
        }));
    };

    const saveNote = (drillId: string, note: string) => {
        setProgress(prev => ({
            ...prev,
            notes: {
                ...prev.notes,
                [drillId]: note
            }
        }));
    };

    const completionCount = Object.values(progress.completions).filter(Boolean).length;
    const totalDrills = DRILLS_DATA.length;
    const completionPercentage = Math.round((completionCount / totalDrills) * 100);

    return {
        progress,
        loading,
        toggleComplete,
        rateDrill,
        saveNote,
        stats: {
            completed: completionCount,
            total: totalDrills,
            percentage: completionPercentage
        }
    };
}
