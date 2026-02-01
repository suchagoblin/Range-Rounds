import { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { DRILLS_DATA } from '../utils/drillsData';
import { DrillCategory } from '../types/drills';
import DrillCard from './DrillCard';

interface DrillsScreenProps {
    onBack: () => void;
}

export default function DrillsScreen({ onBack }: DrillsScreenProps) {
    const sections: DrillCategory[] = ['Driving', 'Full Swing', 'Irons', 'Chipping', 'Putting'];

    return (
        <div className="min-h-screen bg-topo p-4 md:p-6">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
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
                                        <DrillCard key={drill.id} drill={drill} />
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
