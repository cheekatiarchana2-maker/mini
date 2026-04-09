import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import { translations } from '../translations';

export default function KPICards({ language }) {
    const t = translations[language] || translations.English;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Electricity Efficiency Card */}
            <div className="neon-card neon-border-yellow neon-glow-yellow p-10 flex items-center gap-10 w-full group overflow-visible">
                <div className="p-8 bg-yellow-500/10 text-yellow-500 rounded-3xl shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.2)] border border-yellow-500/30">
                    <Zap size={48} className="drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                </div>
                <div className="flex-1">
                    <h3 className="text-white/40 font-bold text-lg w-full mb-3 uppercase tracking-widest">{t.efficiency_title}</h3>
                    <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        92<span className="text-2xl text-white/40 font-bold ml-1">/100</span>
                    </div>
                    <div className="neon-text-green text-xl font-black mt-3 uppercase tracking-wider">{t.efficiency_status}</div>
                </div>
            </div>

            {/* Cost Savings Card */}
            <div className="neon-card neon-border-blue neon-glow-blue p-10 flex items-center gap-10 w-full group overflow-visible">
                <div className="p-8 bg-sky-500/10 text-sky-400 rounded-3xl shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-sky-500/30">
                    <TrendingUp size={48} className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                </div>
                <div className="flex-1">
                    <h3 className="text-white/40 font-bold text-lg w-full mb-3 uppercase tracking-widest">{t.savings_title}</h3>
                    <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        15.4%
                    </div>
                    <div className="neon-text-blue text-xl font-black mt-3 flex items-center gap-2 uppercase tracking-wider">
                        <TrendingUp size={24} /> {t.saved_amount}
                    </div>
                </div>
            </div>
        </div>
    );
}
