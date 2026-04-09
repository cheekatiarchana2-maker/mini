import React from 'react';
import { LineChart, Network, Activity, FileSearch } from 'lucide-react';
import { translations } from '../translations';

export default function HomeNavigationCards({ setCurrentView, language }) {
    const t = translations[language] || translations.English;

    const cards = [
        {
            title: t.nav_forecast_title,
            id: 'Forecasting',
            description: t.nav_forecast_desc,
            icon: Network,
            neonColor: 'neon-border-purple neon-glow-purple',
            iconColor: 'bg-purple-600/20 text-purple-400 border-purple-500/30'
        },
        {
            title: t.nav_anomaly_title,
            id: 'Anomaly Detection',
            description: t.nav_anomaly_desc,
            icon: Activity,
            neonColor: 'neon-border-blue neon-glow-blue',
            iconColor: 'bg-sky-600/20 text-sky-400 border-sky-500/30'
        },
        {
            title: t.nav_patterns_title,
            id: 'Pattern Analysis',
            description: t.nav_patterns_desc,
            icon: LineChart,
            neonColor: 'neon-border-green neon-glow-green',
            iconColor: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
        },
        {
            title: t.nav_finances_title,
            id: 'Finances',
            description: t.nav_finances_desc,
            icon: FileSearch,
            neonColor: 'neon-border-blue neon-glow-blue',
            iconColor: 'bg-blue-600/20 text-blue-400 border-blue-500/30'
        }
    ];

    return (
        <div className="mt-12 w-full">
            <h2 className="text-3xl font-black text-white ml-2 mb-10 tracking-[0.1em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{t.nav_section_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-20 px-2 transition-all">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.id}
                            onClick={() => setCurrentView(card.id)}
                            className={`p-10 neon-card ${card.neonColor} cursor-pointer group flex items-center gap-10 w-full overflow-visible`}
                        >
                            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all shrink-0 ${card.iconColor} border shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:rotate-3`}>
                                <Icon size={48} className="drop-shadow-[0_0_8px_currentColor]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-white tracking-tight group-hover:neon-text-blue transition-colors">{card.title}</h3>
                                <p className="text-white/40 text-lg mt-2 font-bold tracking-tight">{card.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

