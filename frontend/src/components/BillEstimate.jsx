import React, { useState, useEffect } from 'react';
import { IndianRupee, BellRing, Target, Activity } from 'lucide-react';

export default function BillEstimate() {
    const [animatedSpend, setAnimatedSpend] = useState(0);
    const budgetLimit = 3500;
    const currentSpend = 2850;
    
    // Calculate percentage (max 100% for circle fill)
    const usagePercentage = Math.min(100, (currentSpend / budgetLimit) * 100);
    
    // Circle math
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * animatedSpend) / 100;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedSpend(usagePercentage);
        }, 400);
        return () => clearTimeout(timer);
    }, [usagePercentage]);

    return (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl p-8 lg:p-10 flex flex-col h-full animate-in zoom-in-[0.98] duration-500 relative overflow-hidden">
            
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] opacity-[0.15] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="mb-8 relative z-10 flex items-center justify-between">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Target className="text-indigo-400" size={24} />
                    Budget Tracker
                </h3>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                    <IndianRupee size={20} />
                </div>
            </div>

            {/* ── SVG Dial Centered ── */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-h-[220px]">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Background Track Circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle 
                            cx="96" cy="96" r={radius} 
                            stroke="currentColor" strokeWidth="12" fill="transparent" 
                            className="text-slate-800" 
                        />
                        {/* Foreground Progress Circle */}
                        <circle 
                            cx="96" cy="96" r={radius} 
                            stroke="currentColor" strokeWidth="12" fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`transition-all duration-1000 ease-out ${animatedSpend > 90 ? 'text-rose-500' : animatedSpend > 75 ? 'text-amber-400' : 'text-indigo-500'}`} 
                        />
                    </svg>

                    {/* Inner Text Status */}
                    <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 shadow-sm">Total Spend</span>
                        <span className="text-3xl font-black text-white tracking-tighter shadow-xl">
                            ₹{currentSpend}
                        </span>
                    </div>
                </div>
                
                {/* Warning Pill if close to limit */}
                {usagePercentage >= 80 && (
                    <div className="absolute bottom-0 right-0 left-0 flex justify-center translate-y-4">
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 animate-pulse backdrop-blur-sm shadow-xl">
                            <BellRing size={12} /> Limit Approaching
                        </div>
                    </div>
                )}
            </div>

            {/* Text Logs Bottom */}
            <div className="mt-8 relative z-10 border-t border-slate-800 pt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Monthly Ceiling Limit</span>
                    <span className="font-black text-slate-200">₹{budgetLimit}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Remaining Balance</span>
                    <span className={`font-black ${budgetLimit - currentSpend < 500 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ₹{Math.max(0, budgetLimit - currentSpend)}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Projected Final Spend</span>
                    <span className="font-black text-indigo-400 flex items-center gap-1">
                        <Activity size={14} /> ₹3450
                    </span>
                </div>
            </div>
            
        </div>
    );
}
