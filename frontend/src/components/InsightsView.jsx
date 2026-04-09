import React from 'react';
import { Lightbulb, TrendingUp, Zap, ArrowRight, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { translations } from '../translations';

export default function InsightsView({ language, settings = { costSavingTips: true } }) {
    const t = translations[language] || translations.English;

    const armHabits = [
        {
            id: 'h1',
            title: 'Off-Peak Shift',
            desc: 'Moving laundry to 6 AM could save ₹120/mo.',
            impact: 'Significant',
            confidence: 94,
            combo: ['Washing Machine', 'Dishwasher']
        },
        {
            id: 'h2',
            title: 'Idle Power Cut',
            desc: 'Unplugging the home theater at night saves ₹45/mo.',
            impact: 'Moderate',
            confidence: 88,
            combo: ['Entertainment System']
        },
        {
            id: 'h3',
            title: 'Solar Alignment',
            desc: 'Running heavy loads mid-day aligns with internal grid surplus.',
            impact: 'Optimal',
            confidence: 91,
            combo: ['Electric Kettle', 'Vacuum']
        }
    ];

    if (!settings.costSavingTips) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-emerald-500/5 rounded-[32px] flex items-center justify-center border border-emerald-500/10">
                    <Info className="text-emerald-500/20" size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-white/20 font-black uppercase tracking-[0.3em] text-lg">Insights Disabled</h3>
                    <p className="text-white/10 text-xs font-black uppercase tracking-widest">Enable "Cost-Saving Tips" in Settings to view AI recommendations.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto px-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center gap-3">
                        <Lightbulb className="text-emerald-400" size={36} />
                        {t.insights} & Strategies
                    </h1>
                    <p className="text-white/40 text-sm font-black uppercase tracking-[0.2em]">Long-term optimization and ARM-driven behavioral analysis.</p>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Efficiency Growth</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-6 h-1 rounded-full ${i < 5 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Left Column: Habits & Suggestions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 mb-4 ml-2">
                        <TrendingUp size={20} className="text-emerald-400" />
                        Habit Recommendations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {armHabits.map(habit => (
                            <div key={habit.id} className="neon-card neon-border-green neon-glow-green p-8 group relative overflow-hidden flex flex-col justify-between h-full">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <Sparkles className="text-emerald-400" size={24} />
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 tracking-widest uppercase">
                                            {habit.confidence}% Match
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-widest mb-3">{habit.title}</h3>
                                    <p className="text-white/50 text-xs font-medium leading-relaxed mb-6 italic">{habit.desc}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-wrap gap-2">
                                        {habit.combo.map(item => (
                                            <span key={item} className="text-[10px] font-black text-white/30 bg-white/5 px-2 py-1 rounded uppercase tracking-wider">{item}</span>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600/20 transition-all flex items-center justify-center gap-2 group/btn">
                                        Adopt this Habit
                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: General Tips & ARM Logic */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 mb-4 ml-2">
                        <Info size={20} className="text-emerald-400" />
                        Energy Logic
                    </h2>

                    <div className="neon-card bg-slate-900/40 p-8 space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">ARM Combination Rule</h4>
                            <p className="text-xs text-white/40 font-black leading-loose uppercase tracking-tighter">
                                "If the <span className="text-emerald-400 font-bold">Dishwasher</span> runs at 2 PM, there is a <span className="text-emerald-400 font-bold">92% probability</span> that the <span className="text-emerald-400 font-bold">Water Heater</span> will trigger within 20 minutes."
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Savings Ceiling</h4>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl font-black text-white tracking-tight">₹ 820</span>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Projected Saving</span>
                            </div>
                            <p className="text-[10px] text-white/30 font-medium leading-relaxed">Estimated monthly reduction if all 3 habit changes are fully adopted by the household members.</p>
                        </div>

                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 className="text-emerald-400" size={20} />
                            </div>
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-wider leading-tight">Your recent behavior has improved by <span className="text-emerald-400">8.2%</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
