import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

export default function KPICards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 w-full animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-10 w-full group">
                <div className="p-8 bg-purple-50 text-purple-600 rounded-3xl shrink-0 group-hover:scale-110 transition-transform">
                    <Zap size={48} />
                </div>
                <div className="flex-1">
                    <h3 className="text-slate-500 font-bold text-lg w-full mb-3 uppercase tracking-wider">Electricity Efficiency</h3>
                    <div className="text-6xl font-black text-slate-800 tracking-tighter">92<span className="text-2xl text-slate-400 font-bold ml-1">/100</span></div>
                    <div className="text-emerald-500 text-xl font-black mt-3">Excellent (A+)</div>
                </div>
            </div>

            <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-10 w-full group">
                <div className="p-8 bg-emerald-50 text-emerald-600 rounded-3xl shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp size={48} />
                </div>
                <div className="flex-1">
                    <h3 className="text-slate-500 font-bold text-lg w-full mb-3 uppercase tracking-wider">Cost Savings</h3>
                    <div className="text-6xl font-black text-slate-800 tracking-tighter">15.4%</div>
                    <div className="text-emerald-500 text-xl font-black mt-3 flex items-center gap-2">
                        <TrendingUp size={24} /> ₹ 450 saved
                    </div>
                </div>
            </div>
        </div>
    );
}
