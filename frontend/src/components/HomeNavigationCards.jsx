import React from 'react';
import { BarChart2, Search, Share2, IndianRupee } from 'lucide-react';

export default function HomeNavigationCards({ setCurrentView }) {
    const cards = [
        {
            title: 'Forecasting',
            icon: BarChart2,
            color: 'bg-indigo-600 text-white',
            border: 'hover:border-indigo-400'
        },
        {
            title: 'Anomaly Detection',
            icon: Search,
            color: 'bg-blue-600 text-white',
            border: 'hover:border-blue-400'
        },
        {
            title: 'Pattern Analysis',
            icon: Share2,
            color: 'bg-purple-600 text-white',
            border: 'hover:border-purple-400'
        },
        {
            title: 'Cost Optimization',
            id: 'Finances',
            icon: IndianRupee,
            color: 'bg-emerald-600 text-white',
            border: 'hover:border-emerald-400'
        }
    ];

    return (
        <div className="mt-12 w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-10 tracking-tight">Key Analysis & Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-20">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const viewName = card.title === 'Cost Optimization' ? 'Finances' : card.title;
                    return (
                        <div
                            key={card.title}
                            onClick={() => setCurrentView(viewName)}
                            className={`p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 flex items-center gap-10 w-full ${card.border}`}
                        >
                            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all shrink-0 ${card.color} shadow-lg shadow-current/20`}>
                                <Icon size={48} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600">{card.title}</h3>
                                <p className="text-slate-400 text-lg mt-2 font-medium">Deep analysis of household energy trends</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

