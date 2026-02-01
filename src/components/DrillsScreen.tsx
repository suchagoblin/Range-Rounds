import { ArrowLeft, CheckCircle, Trophy, TrendingUp } from 'lucide-react';
import { DRILLS_DATA } from '../utils/drillsData';
import { DrillCategory } from '../types/drills';
import DrillCard from './DrillCard';
import { useDrillProgress } from '../hooks/useDrillProgress';

interface DrillsScreenProps {
    onBack: () => void;
}

export default function DrillsScreen({ onBack }: DrillsScreenProps) {
    const sections: DrillCategory[] = ['Driving', 'Full Swing', 'Irons', 'Chipping', 'Putting'];
    const { progress, toggleComplete, rateDrill, saveNote, stats } = useDrillProgress();

    return (
        <div className="min-h-screen bg-topo p-4 md:p-6">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Training Drills</h1>
                        <p className="text-slate-400 text-sm">Level up your game with pro drills</p>
                    </div>
                </div>

                {/* Progress Dashboard */}
                <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 rounded-2xl p-5 border border-emerald-500/20 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-24 h-24 text-emerald-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    Your Progress
                                </h2>
                                <p className="text-slate-400 text-xs">Complete drills to master your game</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-white">{stats.completed}</span>
                                <span className="text-slate-500 text-sm"> / {stats.total}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/50">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                                style={{ width: `${stats.percentage}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-emerald-400 font-medium">{stats.percentage}% Complete</span>
                            {stats.percentage === 100 && (
                                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    Master Status
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-10 pb-12">
                    {sections.map((category) => {
                        const drills = DRILLS_DATA.filter(d => d.category === category);
                        if (drills.length === 0) return null;

                        return (
                            <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="text-xl font-bold text-white tracking-tight">{category}</h2>
                                    <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                                </div>
                                <div className="space-y-4">
                                    {drills.map((drill) => (
                                        <DrillCard
                                            key={drill.id}
                                            drill={drill}
                                            isCompleted={!!progress.completions[drill.id]}
                                            rating={progress.ratings[drill.id] || 0}
                                            note={progress.notes[drill.id] || ''}
                                            onToggleComplete={() => toggleComplete(drill.id)}
                                            onRate={(r) => rateDrill(drill.id, r)}
                                            onSaveNote={(n) => saveNote(drill.id, n)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
