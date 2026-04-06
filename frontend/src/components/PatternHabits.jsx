import React from 'react';
import { RefreshCcw, Tv, Airplay, Thermometer, Droplet, Clock, Zap } from 'lucide-react';

export default function PatternHabits({ patterns }) {
    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 h-full flex flex-col min-h-[300px]">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                Pattern Analysis
            </h2>
            <div className="text-slate-600 font-medium mb-4 text-sm">Common Usage Patterns:</div>
            <ul className="space-y-4 text-slate-600 flex-1 overflow-y-auto custom-scrollbar text-sm">
                <li className="flex gap-3 items-center pb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span className="leading-relaxed">Evening: Lights + TV</span>
                </li>
                <li className="flex gap-3 items-center pb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span className="leading-relaxed">Morning: Water Heater + Washing Machine</span>
                </li>
                <li className="flex gap-3 items-center pb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span className="leading-relaxed">Afternoon: AC frequently paired with TV</span>
                </li>
            </ul>
        </div>
    );
}
