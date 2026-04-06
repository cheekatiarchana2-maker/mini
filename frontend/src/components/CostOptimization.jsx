import React, { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp, Target, Zap, Sparkles, CheckCircle2, ChevronRight, IndianRupee } from 'lucide-react';

// ─── Mock Backend Data ─────────────────────────────────────────────────────
// All values are fetched from backend in production
const BACKEND = {
    projectedBill: 3420,   // ₹ current projected end-of-month bill
    lastWeekBill: 3100,    // ₹ last week's total for trend comparison
};

const ARM_RECOMMENDATIONS = [
    {
        id: 1,
        icon: '❄️',
        appliance: 'AC',
        text: 'Shift AC usage to after 10 PM to avoid peak-hour tariffs.',
        savings: 320,
        impact: 'High',
    },
    {
        id: 2,
        icon: '🧺',
        appliance: 'Washing Machine',
        text: 'Run washing machine only on Sundays or off-peak hours.',
        savings: 175,
        impact: 'Medium',
    },
    {
        id: 3,
        icon: '📺',
        appliance: 'TV & Console',
        text: 'Eliminate standby drain — hard-disconnect media center overnight.',
        savings: 130,
        impact: 'Medium',
    },
    {
        id: 4,
        icon: '💡',
        appliance: 'Lights',
        text: 'Switch off lights in unoccupied rooms during 12–4 PM daylight hours.',
        savings: 85,
        impact: 'Low',
    },
    {
        id: 5,
        icon: '🌀',
        appliance: 'Fan',
        text: 'Disable ceiling fans running between 3–5 AM when temperatures drop.',
        savings: 45,
        impact: 'Low',
    },
];

const IMPACT_STYLES = {
    High:   { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Medium: { pill: 'bg-amber-100 text-amber-700 border-amber-200' },
    Low:    { pill: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function CostOptimization() {
    const [targetInput, setTargetInput] = useState('3000');
    const [targetBill, setTargetBill] = useState(3000);

    const { projectedBill, lastWeekBill } = BACKEND;

    const totalPotentialSavings = ARM_RECOMMENDATIONS.reduce((s, r) => s + r.savings, 0);
    const savingsNeeded = Math.max(0, projectedBill - targetBill);
    const isAchievable = totalPotentialSavings >= savingsNeeded;
    const billTrend = projectedBill - lastWeekBill;

    // Running projected bill as you scroll through recs
    const runningBill = useMemo(() => {
        let running = projectedBill;
        return ARM_RECOMMENDATIONS.map(rec => {
            running = running - rec.savings;
            return { id: rec.id, runningBill: running };
        });
    }, [projectedBill]);

    const finalProjectedBill = projectedBill - totalPotentialSavings;

    const handleApply = () => {
        const parsed = parseInt(targetInput, 10);
        if (!isNaN(parsed) && parsed > 0) setTargetBill(parsed);
    };

    return (
        <div className="w-full mt-4 max-w-5xl mx-auto pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Page Header ── */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cost Optimization</h1>
                <p className="text-slate-500 text-base mt-2 font-medium">Set a target bill and let ARM-driven insights guide you there.</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                {/* Target Bill */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 flex flex-col gap-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-purple-50/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                        <Target size={12} className="text-purple-500" /> Your Target Bill
                    </p>
                    <p className="text-4xl font-black text-purple-700 relative z-10 tracking-tighter">₹{targetBill.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-slate-400 relative z-10">Monthly ceiling you want to stay under</p>
                </div>

                {/* Current Projected */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 flex flex-col gap-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-indigo-50/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                        <Zap size={12} className={billTrend > 0 ? 'text-rose-500' : 'text-emerald-500'} /> Projected Bill
                    </p>
                    <p className="text-4xl font-black text-slate-800 relative z-10 tracking-tighter">₹{projectedBill.toLocaleString()}</p>
                    <p className={`text-xs font-bold relative z-10 flex items-center gap-1 ${billTrend > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {billTrend > 0 ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                        {billTrend > 0 ? `+₹${billTrend} vs last week` : `-₹${Math.abs(billTrend)} vs last week`}
                    </p>
                </div>

                {/* Potential Savings */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 flex flex-col gap-3 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-emerald-50/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                        <TrendingDown size={12} className="text-emerald-500" /> Potential Savings
                    </p>
                    <p className="text-4xl font-black text-emerald-600 relative z-10 tracking-tighter">₹{totalPotentialSavings}</p>
                    <p className="text-xs font-semibold text-slate-400 relative z-10">If all ARM habits are adopted</p>
                </div>
            </div>

            {/* ── Target Input + Gap Message ── */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-10 space-y-8">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Define Your Goal</h2>

                {/* Input */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                            💵 I want my monthly bill under...
                        </label>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                            <span className="pl-5 pr-3 text-2xl font-black text-slate-300">₹</span>
                            <input
                                type="number"
                                value={targetInput}
                                onChange={(e) => setTargetInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                                placeholder="e.g. 3000"
                                className="flex-1 bg-transparent py-4 pr-5 text-2xl font-black text-slate-800 outline-none placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleApply}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-600/20 active:scale-[0.98] whitespace-nowrap text-base"
                    >
                        Apply Target
                    </button>
                </div>

                {/* Gap Communication */}
                <div className={`p-6 rounded-2xl border flex items-center gap-5 ${
                    savingsNeeded === 0
                        ? 'bg-emerald-50 border-emerald-200'
                        : isAchievable
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-rose-50 border-rose-200'
                }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        savingsNeeded === 0 ? 'bg-emerald-100' : isAchievable ? 'bg-amber-100' : 'bg-rose-100'
                    }`}>
                        {savingsNeeded === 0 ? '✅' : isAchievable ? '💡' : '⚠️'}
                    </div>
                    <div className="flex-1">
                        {savingsNeeded === 0 ? (
                            <>
                                <p className="font-black text-emerald-800 text-base">You're already on track!</p>
                                <p className="text-sm text-emerald-700 font-medium mt-0.5">Your projected bill (₹{projectedBill}) is under your target of ₹{targetBill}.</p>
                            </>
                        ) : (
                            <>
                                <p className="font-black text-slate-800 text-base">
                                    To stay under ₹{targetBill.toLocaleString()}, you need to save <span className="text-purple-700">₹{savingsNeeded}</span>.
                                </p>
                                <p className={`text-sm font-medium mt-0.5 ${isAchievable ? 'text-amber-700' : 'text-rose-700'}`}>
                                    {isAchievable
                                        ? `ARM recommendations can save you ₹${totalPotentialSavings} — that's more than enough!`
                                        : `ARM recommendations can only save ₹${totalPotentialSavings}. Consider raising your target.`}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── ARM Recommendations ── */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="text-purple-500" size={24} />
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">ARM Recommendations</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Apply each habit to see how your projected bill drops.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {ARM_RECOMMENDATIONS.map((rec, idx) => {
                        const running = runningBill.find(r => r.id === rec.id);
                        const impactStyle = IMPACT_STYLES[rec.impact];
                        return (
                            <div key={rec.id} className="flex items-center gap-5 p-5 bg-slate-50 hover:bg-purple-50/50 rounded-2xl border border-transparent hover:border-purple-100 hover:shadow-md transition-all duration-200 group">
                                {/* Step number */}
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:border-purple-300 flex items-center justify-center text-xs font-black text-slate-500 group-hover:text-purple-600 shrink-0 transition-colors">
                                    {idx + 1}
                                </div>

                                {/* Emoji Icon */}
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    {rec.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-slate-700">{rec.appliance}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${impactStyle.pill}`}>
                                            {rec.impact} Impact
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{rec.text}</p>
                                </div>

                                {/* Savings + resulting bill */}
                                <div className="text-right shrink-0 space-y-1 pl-4">
                                    <p className="text-base font-black text-emerald-600">-₹{rec.savings}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">→ Bill: <span className="text-slate-700">₹{running?.runningBill.toLocaleString()}</span></p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Bottom Projection ── */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-[0.15] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <h2 className="text-xl font-black text-white mb-8 relative z-10">Savings Projection</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">

                    <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Current Projected</p>
                        <p className="text-3xl font-black text-white tracking-tighter">₹{projectedBill.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-slate-400 mt-2">Without any changes</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">If All Habits Adopted</p>
                        <p className="text-3xl font-black text-emerald-300 tracking-tighter">₹{finalProjectedBill.toLocaleString()}</p>
                        <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
                            <TrendingDown size={13} /> Saves ₹{totalPotentialSavings}/month
                        </p>
                    </div>

                    <div className={`p-6 rounded-3xl border ${
                        finalProjectedBill <= targetBill
                            ? 'bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border-purple-500/30'
                            : 'bg-rose-900/20 border-rose-500/30'
                    }`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${finalProjectedBill <= targetBill ? 'text-purple-400' : 'text-rose-400'}`}>
                            vs Your Target
                        </p>
                        <p className={`text-3xl font-black tracking-tighter ${finalProjectedBill <= targetBill ? 'text-white' : 'text-rose-300'}`}>
                            ₹{targetBill.toLocaleString()}
                        </p>
                        <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${finalProjectedBill <= targetBill ? 'text-purple-300' : 'text-rose-400'}`}>
                            {finalProjectedBill <= targetBill
                                ? <><CheckCircle2 size={13}/> Target is achievable! ✅</>
                                : `⚠️ Short by ₹${(finalProjectedBill - targetBill).toLocaleString()}`}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
