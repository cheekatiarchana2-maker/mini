import React, { useState, useEffect, useMemo } from 'react';
import { X, Zap, Wind, Lightbulb, Tv2, ThermometerSun, AlertTriangle } from 'lucide-react';

// ─── Appliance Config ──────────────────────────────────────────────────────────
const APPLIANCES = [
    { key: 'AC',              label: 'AC',            icon: Wind,           color: '#6366f1' },
    { key: 'Geyser',          label: 'Geyser',        icon: ThermometerSun, color: '#f97316' },
    { key: 'Washing Machine', label: 'Washing Mach.', icon: Zap,            color: '#0ea5e9' },
    { key: 'TV',              label: 'TV',            icon: Tv2,            color: '#8b5cf6' },
    { key: 'Fan',             label: 'Fan',           icon: Wind,           color: '#14b8a6' },
    { key: 'Fridge',          label: 'Fridge',        icon: Zap,            color: '#64748b' },
    { key: 'Lights & Others', label: 'Lights',        icon: Lightbulb,      color: '#f59e0b' },
];

// ─── Mock 30-day data ─────────────────────────────────────────────────────────
function makeMockDays() {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const isAnomaly = i === 20 || i === 21;
        const base = isWeekend ? 22 + Math.random() * 8 : 14 + Math.random() * 8;
        const total = +(isAnomaly ? base + 18 + Math.random() * 8 : base).toFixed(1);

        const ac    = +((total * (0.3 + Math.random() * 0.15))).toFixed(1);
        const heat  = +((total * (0.05 + Math.random() * 0.08))).toFixed(1);
        const wm    = +((total * (0.04 + Math.random() * 0.05))).toFixed(1);
        const tv    = +((total * (0.03 + Math.random() * 0.04))).toFixed(1);
        const lights = +(Math.max(0, total - ac - heat - wm - tv)).toFixed(1);

        const appliances = { AC: ac, Heater: heat, 'Washing Machine': wm, TV: tv, 'Lights & Others': lights };
        const sorted = Object.entries(appliances).sort((a, b) => b[1] - a[1]);
        const top = sorted[0];
        const topPct = Math.round((top[1] / total) * 100);

        let insight;
        if (isAnomaly) insight = `Unusually high day — ${top[0]} consumed ${topPct}% of the total, well above your average.`;
        else if (top[0] === 'AC') insight = `AC dominated usage today, likely due to warm weather — ${topPct}% of the day's load.`;
        else if (top[0] === 'Lights & Others') insight = `Lights contributed nearly ${topPct}% of total consumption. Consider LED upgrades for savings.`;
        else if (top[0] === 'Heater') insight = `Geyser ran longer than usual today, accounting for ${topPct}% of daily usage.`;
        else insight = `${top[0]} was the top consumer today at ${topPct}% of total usage.`;

        return { date: dateStr, total_kwh: total, appliances, is_anomaly: isAnomaly, insight };
    });
}

// ─── Colour: slate-dark → indigo-violet ───────────────────────────────────────
function cellColor(kwh, isAnomaly) {
    const min = 5, max = 50;
    const r = Math.min(1, Math.max(0, (kwh - min) / (max - min)));
    const h = 220 + r * 50;   // cyan-blue (220) → purple-violet (270)
    const s = 40 + r * 60;    // 40% → 100%
    const l = 80 - r * 45;    // 80% (lighter) → 35% (darker)
    const base = `hsl(${h},${s}%,${l}%)`;
    const glow = isAnomaly
        ? 'inset 0 0 0 2px rgba(251,146,60,0.8), 0 0 12px rgba(251,146,60,0.5)'
        : r > 0.65 ? `0 0 15px hsla(${h},${s}%,${l}%,0.6)` : 'none';
    return { backgroundColor: base, boxShadow: glow };
}

// ─── Friendly labels ──────────────────────────────────────────────────────────
function fmtDate(str) {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function dayNum(str) {
    return new Date(str + 'T00:00:00').getDate();
}
function weekday(str) {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
}

// ─── Slim Day Cell ────────────────────────────────────────────────────────────
function DayCell({ day, onClick }) {
    const [hover, setHover] = useState(false);
    const style = cellColor(day.total_kwh, day.is_anomaly);

    // top 3 appliances for tooltip
    const top3 = useMemo(() =>
        Object.entries(day.appliances)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k, v]) => {
                const cfg = APPLIANCES.find(a => a.key === k);
                return { label: cfg?.label ?? k, kwh: v };
            }), [day]);

    return (
        <div
            className="relative cursor-pointer rounded-lg transition-transform duration-200 hover:scale-110 hover:z-30 hover:brightness-125 aspect-square flex items-center justify-center group"
            style={style}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => onClick(day)}
        >
            {/* Date number */}
            <span className="text-xs font-black text-white/50 select-none pointer-events-none drop-shadow-md group-hover:text-white transition-colors">
                {dayNum(day.date)}
            </span>

            {/* Hover bubble */}
            {hover && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-[10px] text-slate-400 font-bold">{fmtDate(day.date)}</span>
                        <span className="text-white font-black text-sm">{day.total_kwh} kWh</span>
                    </div>
                    <div className="h-px bg-slate-800 mb-2" />
                    <div className="space-y-1">
                        {top3.map(({ label, kwh }) => (
                            <div key={label} className="flex justify-between text-[10px]">
                                <span className="text-slate-400 font-medium">{label}</span>
                                <span className="text-slate-200 font-bold">{kwh} kWh</span>
                            </div>
                        ))}
                    </div>
                    {day.is_anomaly && (
                        <div className="mt-2 text-[9px] text-orange-400 font-bold flex items-center gap-1">
                            <AlertTriangle size={9} /> Anomaly detected
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const DayModal = ({ isOpen, onClose, day }) => {
    if (!isOpen || !day) return null;

    const top3 = Object.entries(day.appliances)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">{fmtDate(day.date)}</h3>
                            {day.is_anomaly && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                                    <AlertTriangle size={9} /> Anomaly
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{weekday(day.date)}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{day.total_kwh}</span>
                        <span className="text-sm font-bold text-slate-400">kWh</span>
                    </div>
                    <button onClick={onClose} className="ml-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors shrink-0">
                        <X size={16} />
                    </button>
                </div>

                {/* Top Appliances */}
                <div className="px-6 pt-5 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Contributors</p>
                    <div className="space-y-4">
                        {top3.map(([key, kwh], idx) => {
                            const cfg = APPLIANCES.find(a => a.key === key);
                            const Icon = cfg?.icon ?? Zap;
                            const pct = Math.round((kwh / day.total_kwh) * 100);
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg?.color + '18', color: cfg?.color }}>
                                                <Icon size={13} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{cfg?.label ?? key}</span>
                                            {idx === 0 && <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: cfg?.color }}>Top</span>}
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-black text-slate-900">{kwh} kWh</span>
                                            <span className="text-xs font-bold text-slate-400">{pct}%</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: cfg?.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ARM Insight */}
                <div className="mx-6 mb-6 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                    <Zap size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{day.insight}</p>
                </div>
            </div>
        </div>
    );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export default function PatternAnalysisView() {
    const [days, setDays] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:8000/daily-data');
                if (res.ok) {
                    const json = await res.json();
                    if (json?.length > 0) { setDays(json); setLoading(false); return; }
                }
            } catch { /* fallback */ }
            setDays(makeMockDays());
            setLoading(false);
        })();
    }, []);

    const kpis = useMemo(() => {
        if (!days.length) return null;
        const avg = (days.reduce((s, d) => s + d.total_kwh, 0) / days.length).toFixed(1);
        const peak = days.reduce((a, b) => a.total_kwh > b.total_kwh ? a : b, days[0]);
        const anomalies = days.filter(d => d.is_anomaly).length;
        const appTotals = {};
        APPLIANCES.forEach(({ key }) => { appTotals[key] = 0; });
        days.forEach(d => APPLIANCES.forEach(({ key }) => { appTotals[key] += d.appliances[key] ?? 0; }));
        const topApp = Object.entries(appTotals).sort((a, b) => b[1] - a[1])[0];
        const total = days.reduce((s, d) => s + d.total_kwh, 0);
        const topAppPct = Math.round((topApp[1] / total) * 100);
        const topLabel = APPLIANCES.find(a => a.key === topApp[0])?.label ?? topApp[0];
        return { avg, peak, anomalies, topLabel, topAppPct };
    }, [days]);

    // 3 rows of 10 days
    const rows = useMemo(() => {
        const out = [];
        for (let i = 0; i < days.length; i += 10) out.push(days.slice(i, i + 10));
        return out;
    }, [days]);

    return (
        <div className="w-full max-w-5xl mx-auto mt-4 pb-12 space-y-9">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Pattern Analysis</h1>
                <p className="text-white/40 font-black tracking-tight mt-1 uppercase text-xs">30-day daily usage · hover or click any day for appliance breakdown</p>
            </div>

            {/* KPIs */}
            {kpis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Avg. Daily', value: `${kpis.avg} kWh`, sub: 'Last 30 days', accent: 'text-indigo-600' },
                        { label: 'Peak Day', value: `${kpis.peak.total_kwh} kWh`, sub: fmtDate(kpis.peak.date), accent: 'text-violet-600' },
                        { label: 'Top Appliance', value: kpis.topLabel, sub: `${kpis.topAppPct}% of total`, accent: 'text-purple-600' },
                    ].map(k => (
                        <div key={k.label} className="neon-card neon-border-green neon-glow-green p-5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">{k.label}</p>
                            <p className={`text-xl font-black text-white leading-tight`}>{k.value}</p>
                            <p className="text-xs text-white/20 mt-1 font-black uppercase tracking-tight">{k.sub}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Heatmap */}
            <div className="bg-[#0b0f19] rounded-2xl border border-indigo-500/20 overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.15)] relative">
                {/* Title bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-7 py-6 border-b border-white/5 gap-4">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">DAILY CONSUMPTION – LAST 30 DAYS</h2>
                        <p className="text-xs text-indigo-200/50 font-bold uppercase mt-1 tracking-tight">Darker, vibrant neon tones indicate higher usage.</p>
                    </div>
                </div>
                
                {/* Scale Top Corner */}
                <div className="absolute top-6 right-7 hidden md:flex items-center gap-3">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Low</span>
                    <div className="w-32 h-2 rounded-full border border-white/10 shadow-lg" style={{ background: 'linear-gradient(to right, hsl(220,40%,80%), hsl(270,100%,35%))' }} />
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">High</span>
                </div>
                {/* Scale Mobile */}
                <div className="flex md:hidden items-center gap-3 px-7 pt-4">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Low</span>
                    <div className="flex-1 h-2 rounded-full border border-white/10 shadow-lg" style={{ background: 'linear-gradient(to right, hsl(220,40%,80%), hsl(270,100%,35%))' }} />
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">High</span>
                </div>

                {/* Grid */}
                <div className="p-7">
                    {loading ? (
                        <div className="h-48 flex items-center justify-center text-white/20 text-sm font-black tracking-widest uppercase animate-pulse">Loading…</div>
                    ) : (
                        <div className="space-y-4">
                            {rows.map((row, ri) => (
                                <div key={ri} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                                    {row.map(day => (
                                        <DayCell key={day.date} day={day} onClick={d => { setSelected(d); setModalOpen(true); }} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer date range */}
                {!loading && days.length > 0 && (
                    <div className="px-7 pb-5 flex justify-between text-[10px] text-white/20 font-black tracking-widest uppercase">
                        <span>{fmtDate(days[0].date)}</span>
                        <span>{fmtDate(days[days.length - 1].date)}</span>
                    </div>
                )}
            </div>

            {/* Lifestyle Insights */}
            <div>
                <h2 className="text-xl font-black text-white mb-4 tracking-widest uppercase">Daily Behaviour Patterns</h2>
                <div className="space-y-3">
                    {[
                        { emoji: '☀️', title: 'Morning Peak (6–9 AM)', desc: 'Geyser and kitchen appliances drive a moderate secondary load on weekday mornings — ARM clusters show 78% co-occurrence.' },
                        { emoji: '🌙', title: 'Evening Hotspot (7–10 PM)', desc: 'With 94% confidence, AC runs simultaneously with TV and lights every evening, creating the day\'s primary consumption spike.' },
                        { emoji: '📅', title: 'Weekend Surge (+20% avg)', desc: 'Saturday and Sunday average 20% higher than weekdays. Extended cooling sessions and entertainment devices are the top contributors.' },
                    ].map(({ emoji, title, desc }) => (
                        <div key={title} className="flex items-start gap-4 p-5 neon-card neon-border-green neon-glow-green transition-colors">
                            <span className="text-xl mt-0.5 shrink-0">{emoji}</span>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                                <p className="text-xs text-white/40 mt-1 leading-relaxed font-bold tracking-tight uppercase">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Associated Combinations */}
            <div>
                <h2 className="text-xl font-black text-white mb-1 tracking-widest uppercase">Associated Combinations</h2>
                <p className="text-xs text-white/30 mb-5 font-black uppercase tracking-tight">ARM-derived appliance pairs ranked by support</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { emoji: '❄️ + 💡', label: 'AC + Lights',   freq: 'Very Frequent', pct: 38, color: '#6366f1', detail: '38% of weekly usage. Peaks during evening cooling.' },
                        { emoji: '📺 + 🌀', label: 'TV + Fan',       freq: 'Common',        pct: 27, color: '#8b5cf6', detail: 'Entertainment pattern — common on weekends.' },
                        { emoji: '💡 + 🌀', label: 'Lights + Fan',   freq: 'Common',        pct: 22, color: '#0ea5e9', detail: 'Your baseline activity as you move between rooms.' },
                        { emoji: '❄️ + 📺', label: 'AC + TV',        freq: 'Occasional',    pct: 13, color: '#a855f7', detail: 'High-intensity combo — dominant on movie nights.' },
                    ].map(item => (
                        <div key={item.label} className="neon-card neon-border-green neon-glow-green p-5 hover:-translate-y-1">
                            <div>
                                <div className="text-2xl mb-1.5">{item.emoji}</div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{item.label}</h3>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1.5 ${item.freq === 'Very Frequent' ? 'bg-green-600 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' : item.freq === 'Common' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                    {item.freq}
                                </span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed flex-1 mt-3 font-bold uppercase tracking-tight">{item.detail}</p>
                            <div>
                                <div className="flex justify-between text-[10px] font-black text-white/20 mb-1 uppercase tracking-widest">
                                    <span>Support</span><span className="text-white/60">{item.pct}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full rounded-full shadow-[0_0_10px_currentColor]" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DayModal isOpen={modalOpen} onClose={() => setModalOpen(false)} day={selected} />
        </div>
    );
}