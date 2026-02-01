import { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { DRILLS_DATA } from '../utils/drillsData';
import { DrillCategory } from '../types/drills';
import DrillCard from './DrillCard';

interface DrillsScreenProps {
    onBack: () => void;
}

export default function DrillsScreen({ onBack }: DrillsScreenProps) {
    const [selectedCategory, setSelectedCategory] = useState<DrillCategory | 'All'>('All');

    const categories: (DrillCategory | 'All')[] = ['All', 'Putting', 'Chipping', 'Full Swing'];

    const filteredDrills = selectedCategory === 'All'
        ? DRILLS_DATA
        : DRILLS_DATA.filter(drill => drill.category === selectedCategory);

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

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="w-4 h-4 text-slate-500 flex-shrink-0 mr-1" />
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredDrills.map((drill) => (
                        <DrillCard key={drill.id} drill={drill} />
                    ))}
                </div>

                {filteredDrills.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <p>No drills found for this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
