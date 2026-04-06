import React from 'react';
import { Zap, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export default function InsightsPanel({ insights }) {
    if (!insights) return null;
    const { energy_score, recommendations } = insights;

    const scoreColor = energy_score > 80 ? 'text-green-400' : energy_score > 50 ? 'text-yellow-400' : 'text-red-400';
    const ScoreBg = energy_score > 80 ? 'bg-green-400/10' : energy_score > 50 ? 'bg-yellow-400/10' : 'bg-red-400/10';

    return (
        <div className="p-6 bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-700 h-full flex flex-col">
            <div className="flex items-center gap-6 mb-6">
                <div className={`p-5 rounded-2xl flex items-center justify-center ${ScoreBg} shadow-inner`}>
                    <Zap size={44} className={scoreColor} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                        <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Energy Score</h2>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${ScoreBg} ${scoreColor}`}>
                            {energy_score > 80 ? 'Excellent' : energy_score > 50 ? 'Needs Work' : 'Critical'}
                        </span>
                    </div>
                    <div className={`text-6xl font-extrabold tracking-tight ${scoreColor}`}>
                        {Math.round(energy_score)}<span className="text-2xl text-slate-500 font-medium tracking-normal ml-1">/100</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-3 mt-4 overflow-hidden border border-slate-700 shadow-inner">
                        <div className={`h-3 rounded-full ${energy_score > 80 ? 'bg-green-500' : energy_score > 50 ? 'bg-yellow-400' : 'bg-red-500'} transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, energy_score))}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="h-px w-full bg-slate-700/50 mb-6"></div>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb size={22} className="text-blue-400" />
                Alerts & Optimizations
            </h3>
            <ul className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {recommendations.map((rec, i) => {
                    const isSystemCritical = rec.toLowerCase().includes('anomaly') || rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('abnormal');
                    const isWarning = !isSystemCritical && (rec.toLowerCase().includes('multiple') || rec.toLowerCase().includes('monitor') || rec.toLowerCase().includes('increase'));
                    const isGood = rec.toLowerCase().includes('great') || rec.toLowerCase().includes('normal') || rec.toLowerCase().includes('efficient');

                    let itemClass = "bg-slate-700/30 border-slate-700/50 text-slate-300";
                    let IconItem = Lightbulb;
                    let iconColor = "text-blue-400";

                    if (isGood) {
                        itemClass = "bg-green-500/10 border-green-500/20 text-green-200";
                        IconItem = CheckCircle;
                        iconColor = "text-green-400";
                    } else if (isSystemCritical) {
                        itemClass = "bg-red-500/10 border-red-500/20 text-red-200";
                        IconItem = AlertTriangle;
                        iconColor = "text-red-400";
                    } else if (isWarning) {
                        itemClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-200";
                        IconItem = AlertTriangle;
                        iconColor = "text-yellow-400";
                    }

                    return (
                        <li key={i} className={`flex gap-4 items-start p-4 rounded-xl border ${itemClass} transition-colors hover:bg-opacity-80`}>
                            <IconItem className={`${iconColor} shrink-0 mt-0.5`} size={20} />
                            <span className="leading-relaxed font-medium">{rec}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
