import { useState, useEffect } from 'react';
import { X, ChevronRight, Target, Trophy, Zap, Map } from 'lucide-react';

interface FeatureTourProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeatureTour({ isOpen, onClose }: FeatureTourProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Reset slide when opening
    useEffect(() => {
        if (isOpen) setCurrentSlide(0);
    }, [isOpen]);

    if (!isOpen) return null;

    const slides = [
        {
            title: "Welcome to Range Rounds",
            description: "Your ultimate companion for practice and play. Let's take a quick tour of what you can do.",
            icon: <Target className="w-16 h-16 text-emerald-400" />,
            color: "from-emerald-500/20 to-slate-900"
        },
        {
            title: "Track Your Shots",
            description: "Record every shot at the range. Log distances, clubs, and accuracy to build your personal stats history.",
            icon: <Map className="w-16 h-16 text-blue-400" />,
            color: "from-blue-500/20 to-slate-900"
        },
        {
            title: "Play Courses",
            description: "Simulate real rounds on your favorite courses. Track score, putts, and fairways hit.",
            icon: <Trophy className="w-16 h-16 text-amber-400" />,
            color: "from-amber-500/20 to-slate-900"
        },
        {
            title: "Training Drills",
            description: "NEW! Access our library of pro drills. Rate them, track your completion, and save notes to improve your game.",
            icon: <Zap className="w-16 h-16 text-purple-400" />,
            color: "from-purple-500/20 to-slate-900"
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onClose();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className={`p-8 pt-12 min-h-[450px] flex flex-col items-center text-center bg-gradient-to-b ${slides[currentSlide].color}`}>

                    <div className="mb-8 p-6 bg-slate-950/30 rounded-full border border-white/10 shadow-xl backdrop-blur-sm animate-in zoom-in duration-300 fill-mode-both">
                        {slides[currentSlide].icon}
                    </div>

                    <h2 key={`title-${currentSlide}`} className="text-2xl font-bold text-white mb-3 animate-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-both">
                        {slides[currentSlide].title}
                    </h2>

                    <p key={`desc-${currentSlide}`} className="text-slate-300 leading-relaxed mb-8 animate-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-both">
                        {slides[currentSlide].description}
                    </p>

                    {/* Dots */}
                    <div className="flex gap-2 mb-8 mt-auto">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-6' : 'bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex w-full gap-4">
                        {currentSlide > 0 && (
                            <button
                                onClick={prevSlide}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={nextSlide}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                            {currentSlide < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
