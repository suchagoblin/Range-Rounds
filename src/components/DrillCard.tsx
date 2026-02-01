import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, Activity, Target, Zap } from 'lucide-react';
import { Drill } from '../types/drills';

interface DrillCardProps {
    drill: Drill;
}

export default function DrillCard({ drill }: DrillCardProps) {
    const [expanded, setExpanded] = useState(false);

    const [userRating, setUserRating] = useState<number>(() => {
        const saved = localStorage.getItem(`drill-rating-${drill.id}`);
        return saved ? parseInt(saved) : 0;
    });

    const handleRate = (rating: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setUserRating(rating);
        localStorage.setItem(`drill-rating-${drill.id}`, rating.toString());
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Intermediate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Advanced': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Putting': return <Target className="w-4 h-4" />;
            case 'Chipping': return <Activity className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-4 focus:outline-none"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border flex items-center gap-1.5 ${getDifficultyColor(drill.difficulty)}`}>
                                {drill.difficulty}
                            </span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                {getCategoryIcon(drill.category)}
                                {drill.category}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{drill.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{drill.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-amber-400 text-xs font-bold">{drill.rating}</span>
                        </div>
                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                    </div>
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px w-full bg-slate-700/50 mb-4"></div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Instructions</h4>
                    <ul className="space-y-2 mb-6">
                        {drill.steps.map((step, index) => (
                            <li key={index} className="flex gap-3 text-sm text-slate-400">
                                <span className="flex-shrink-0 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                                    {index + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-xs font-medium text-slate-400">Rate this drill:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={(e) => handleRate(star, e)}
                                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                >
                                    <Star
                                        className={`w-5 h-5 ${star <= userRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
