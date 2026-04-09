import React, { useState, useMemo } from 'react';
import { TrendingDown, TrendingUp, Target, Zap, Sparkles, CheckCircle2, ChevronRight, IndianRupee } from 'lucide-react';
import { translations } from '../translations';

// ─── Mock Backend Data ─────────────────────────────────────────────────────
const BACKEND = {
    projectedBill: 3420,   
    lastWeekBill: 3100,    
};

const ARM_RECOMMENDATIONS = [
    {
        id: 1,
        icon: '❄️',
        appliance: 'AC',
        text_en: 'Shift AC usage to after 10 PM to avoid peak-hour tariffs.',
        text_hi: 'पीक-ऑवर टैरिफ से बचने के लिए एसी का उपयोग रात 10 बजे के बाद करें।',
        text_te: 'పీక్ అవర్ టారిఫ్‌లను నివారించడానికి ఏసీ వాడకాన్ని రాత్రి 10 గంటల తర్వాతకు మార్చండి.',
        savings: 320,
        impact: 'High',
    },
    {
        id: 2,
        icon: '🧺',
        appliance: 'Washing Machine',
        text_en: 'Run washing machine only on Sundays or off-peak hours.',
        text_hi: 'वाशिंग मशीन केवल रविवार या ऑफ-पीक घंटों में चलाएं।',
        text_te: 'వాషింగ్ మెషీన్‌ను ఆదివారాల్లో లేదా ఆఫ్-పీక్ సమయాల్లో మాత్రమే వాడండి.',
        savings: 175,
        impact: 'Medium',
    },
    {
        id: 3,
        icon: '📺',
        appliance: 'TV & Console',
        text_en: 'Eliminate standby drain — hard-disconnect media center overnight.',
        text_hi: 'स्टैंडबाय ड्रेन खत्म करें — रात भर मीडिया सेंटर को पूरी तरह से डिस्कनेक्ट करें।',
        text_te: 'స్టాండ్‌బై పవర్ వృధాను అరికట్టండి — రాత్రి పూట టీవీ మరియు మీడియా సెంటర్‌ను పూర్తిగా ఆపివేయండి.',
        savings: 130,
        impact: 'Medium',
    },
    {
        id: 4,
        icon: '💡',
        appliance: 'Lights',
        text_en: 'Switch off lights in unoccupied rooms during 12–4 PM daylight hours.',
        text_hi: 'दोपहर 12-4 बजे के बीच खाली कमरों की लाइटें बंद रखें।',
        text_te: 'మధ్యాహ్నం 12-4 గంటల మధ్య ఖాళీగా ఉన్న గదుల్లో లైట్లను ఆపివేయండి.',
        savings: 85,
        impact: 'Low',
    },
];

const IMPACT_STYLES = {
    High:   { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Medium: { pill: 'bg-amber-100 text-amber-700 border-amber-200' },
    Low:    { pill: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function CostOptimization({ language }) {
    const t = translations[language] || translations.English;
    const [targetInput, setTargetInput] = useState('3000');
    const [targetBill, setTargetBill] = useState(3000);

    const { projectedBill, lastWeekBill } = BACKEND;

    const totalPotentialSavings = ARM_RECOMMENDATIONS.reduce((s, r) => s + r.savings, 0);
    const savingsNeeded = Math.max(0, projectedBill - targetBill);
    const isAchievable = totalPotentialSavings >= savingsNeeded;
    const billTrend = projectedBill - lastWeekBill;

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
                <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{t.cost_opt_title}</h1>
                <p className="text-white/40 font-black tracking-tight mt-1 uppercase text-xs">{t.cost_opt_desc}</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="neon-card neon-border-orange neon-glow-orange p-7">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                        <Target size={12} className="text-orange-500" /> {t.target_bill}
                    </p>
                    <p className="text-4xl font-black text-orange-500 relative z-10 tracking-tighter shadow-orange-500/20 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">₹{targetBill.toLocaleString()}</p>
                    <p className="text-xs font-black uppercase text-white/20 relative z-10 tracking-tight">{t.target_ceiling_desc}</p>
                </div>

                <div className="neon-card neon-border-blue neon-glow-blue p-7">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                        <Zap size={12} className={billTrend > 0 ? 'text-rose-500' : 'neon-text-blue'} /> {t.projected_bill}
                    </p>
                    <p className="text-4xl font-black text-white relative z-10 tracking-tighter">₹{projectedBill.toLocaleString()}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest relative z-10 flex items-center gap-1 ${billTrend > 0 ? 'text-rose-400' : 'neon-text-blue'}`}>
                        {billTrend > 0 ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}
                        {billTrend > 0 ? `+₹${billTrend} ${t.vs_last_week}` : `-₹${Math.abs(billTrend)} ${t.vs_last_week}`}
                    </p>
                </div>

                <div className="neon-card neon-border-green neon-glow-green p-7">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest relative z-10 flex items-center gap-1.5">
                        <TrendingDown size={12} className="neon-text-green" /> {t.potential_savings_title}
                    </p>
                    <p className="text-4xl font-black text-white relative z-10 tracking-tighter shadow-green-400/20 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">₹{totalPotentialSavings}</p>
                    <p className="text-xs font-black text-white/20 uppercase tracking-widest relative z-10">{t.arm_habits_desc}</p>
                </div>
            </div>

            {/* ── Goal Input ── */}
            <div className="neon-card neon-border-orange neon-glow-orange p-8 lg:p-10 space-y-8">
                <h2 className="text-xl font-black text-white tracking-widest uppercase">{t.define_goal}</h2>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">
                            💵 {t.bill_under_label}
                        </label>
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-orange-500">
                            <span className="pl-5 pr-3 text-2xl font-black text-white/10">₹</span>
                            <input
                                type="number"
                                value={targetInput}
                                onChange={(e) => setTargetInput(e.target.value)}
                                className="flex-1 bg-transparent py-4 text-2xl font-black text-white outline-none"
                            />
                        </div>
                    </div>
                    <button onClick={handleApply} className="px-8 py-4 bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-[0.98] transition-all hover:bg-orange-500">
                        {t.apply_target}
                    </button>
                </div>

                <div className={`p-6 rounded-2xl border flex items-center gap-5 ${
                    savingsNeeded === 0 ? 'bg-emerald-50 border-emerald-200' : isAchievable ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'
                }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                        savingsNeeded === 0 ? 'bg-emerald-100' : isAchievable ? 'bg-amber-100' : 'bg-rose-100'
                    }`}>
                        {savingsNeeded === 0 ? '✅' : isAchievable ? '💡' : '⚠️'}
                    </div>
                    <div>
                        {savingsNeeded === 0 ? (
                            <>
                                <p className="font-black text-emerald-800 text-base">{t.on_track}</p>
                                <p className="text-sm text-emerald-700 font-medium">{t.projected_under}</p>
                            </>
                        ) : (
                            <>
                                <p className="font-black text-slate-800 text-base">
                                    {t.stay_under_prefix} ₹{targetBill.toLocaleString()}, {t.need_to_save} <span className="text-purple-700">₹{savingsNeeded}</span>.
                                </p>
                                <p className={`text-sm font-medium ${isAchievable ? 'text-amber-700' : 'text-rose-700'}`}>
                                    {isAchievable ? t.more_than_enough : t.consider_raising}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recommendations ── */}
            <div className="neon-card neon-border-orange neon-glow-orange p-8 lg:p-10">
                <h2 className="text-xl font-black text-white tracking-widest uppercase mb-8 flex items-center gap-3">
                    <Sparkles className="text-orange-400" size={24} /> {t.arm_recs}
                </h2>
                <div className="space-y-4">
                    {ARM_RECOMMENDATIONS.map((rec, idx) => {
                        const running = runningBill.find(r => r.id === rec.id);
                        const recommendationText = language === 'Telugu' ? rec.text_te : (language === 'Hindi' ? rec.text_hi : rec.text_en);
                        const applianceLabel = language === 'Hindi' ? (t[`appliance_${rec.appliance.toLowerCase().replace(' ', '')}`] || rec.appliance) : (language === 'Telugu' ? (t[`appliance_${rec.appliance.toLowerCase().replace(' ', '')}`] || rec.appliance) : rec.appliance);
                        return (
                            <div key={rec.id} className="flex items-center gap-5 p-5 bg-white/5 hover:bg-orange-500/10 rounded-2xl border border-white/10 hover:border-orange-500/30 transition-all group">
                                <div className="w-12 h-12 rounded-xl bg-orange-900/40 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)] flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110">{rec.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{applianceLabel}</p>
                                    <p className="text-sm font-bold text-white/70 uppercase tracking-tight italic">{recommendationText}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-base font-black neon-text-green">-₹{rec.savings}</p>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">→ ₹{running?.runningBill.toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Projection ── */}
            <div className="bg-slate-900 rounded-[2.5rem] shadow-xl p-8 lg:p-10 text-white relative overflow-hidden">
                <h2 className="text-xl font-black mb-8">{t.savings_projection}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-slate-800/60 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.current_projected || 'Current Projected'}</p>
                        <p className="text-3xl font-black tracking-tighter">₹{projectedBill.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-slate-400 mt-2">{t.without_changes}</p>
                    </div>
                    <div className="bg-emerald-900/40 border border-emerald-500/30 p-6 rounded-3xl">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">{t.habits_adopted}</p>
                        <p className="text-3xl font-black text-emerald-300 tracking-tighter">₹{finalProjectedBill.toLocaleString()}</p>
                        <p className="text-xs font-bold text-emerald-500 mt-2">Saves ₹{totalPotentialSavings}/mo</p>
                    </div>
                    <div className={`p-6 rounded-3xl border ${finalProjectedBill <= targetBill ? 'bg-purple-900/40 border-purple-500/30' : 'bg-rose-900/20 border-rose-500/30'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${finalProjectedBill <= targetBill ? 'text-purple-400' : 'text-rose-400'}`}>{t.vs_your_target}</p>
                        <p className="text-3xl font-black tracking-tighter">₹{targetBill.toLocaleString()}</p>
                        <p className="text-xs font-bold mt-2">{finalProjectedBill <= targetBill ? t.target_achievable : `${t.short_by} ₹${(finalProjectedBill - targetBill).toLocaleString()}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
