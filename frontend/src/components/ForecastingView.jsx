import React, { useState, useEffect, useMemo } from 'react';
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
    BarChart, Bar, Cell,
} from 'recharts';
import {
    TrendingUp, TrendingDown, Zap, Calendar,
    DollarSign, Activity, Info,
} from 'lucide-react';

/* ─────────────────────────────────────
   Demo data generators
───────────────────────────────────── */

/** Daily (hourly points for next 24 h) – line + confidence band */
function buildDailyData() {
    return Array.from({ length: 24 }, (_, h) => {
        const base = 3 + Math.sin((h - 6) * 0.45) * 1.8 + (h === 20 ? 1.4 : 0);
        const sigma = 0.25 + h * 0.018;
        const label = `${String(h).padStart(2, '0')}:00`;
        return {
            label,
            forecast: +base.toFixed(2),
            upper:    +(base + sigma).toFixed(2),
            lower:    +(Math.max(0, base - sigma)).toFixed(2),
        };
    });
}

/** Weekly (next 7 days) – bar chart */
const WEEKLY_DATA = [
    { label: 'Mon', forecast: 4.8 },
    { label: 'Tue', forecast: 5.1 },
    { label: 'Wed', forecast: 5.6 },
    { label: 'Thu', forecast: 5.3 },
    { label: 'Fri', forecast: 6.0 },
    { label: 'Sat', forecast: 6.8 },
    { label: 'Sun', forecast: 7.2 },
];

/** Monthly — one bar per day for the current month */
function buildMonthlyData() {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth();                       // 0-indexed
    const days  = new Date(year, month + 1, 0).getDate(); // days in month
    return Array.from({ length: days }, (_, i) => {
        const day   = i + 1;
        const base  = 3.2 + Math.sin(i * 0.22) * 1.4 + (i % 7 >= 5 ? 0.8 : 0); // weekends slightly higher
        const peak  = +(base * 0.65).toFixed(2);
        const offP  = +(base * 0.35).toFixed(2);
        return { label: String(day), peak, offPeak: offP };
    });
}
const MONTHLY_DATA = buildMonthlyData();

/* ─────────────────────────────────────
   Tooltip components
───────────────────────────────────── */
const LineTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload ?? {};
    return (
        <div style={tooltipStyle}>
            <p style={tooltipLabel}>{label}</p>
            {d.forecast != null && <p style={{ color: '#a78bfa' }}>🔮 Forecast: <strong>{d.forecast} kWh</strong></p>}
            {d.upper   != null && <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Range: {d.lower} – {d.upper} kWh</p>}
        </div>
    );
};

const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={tooltipStyle}>
            <p style={tooltipLabel}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, marginTop: 3 }}>
                    {p.name}: <strong>{p.value} kWh</strong>
                </p>
            ))}
        </div>
    );
};

const tooltipStyle = {
    background: 'linear-gradient(135deg,#1e293b,#0f172a)',
    border: '1px solid #334155',
    borderRadius: 14,
    padding: '12px 16px',
    fontSize: 13,
    color: '#f8fafc',
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    minWidth: 170,
};
const tooltipLabel = { fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 };

/* ─────────────────────────────────────
   Main component
───────────────────────────────────── */
export default function ForecastingView({ language }) {
    const [view, setView]           = useState('Daily');   // Daily | Weekly | Monthly
    const [apiData, setApiData]     = useState(null);

    const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

    // Try real API; fall back silently
    useEffect(() => {
        if (view !== 'Daily') { setApiData(null); return; }
        fetch('http://127.0.0.1:8000/forecast')
            .then(r => r.json())
            .then(json => {
                if (json?.length > 0) {
                    const mapped = json.slice(0, 24).map((r, h) => ({
                        label:    `${String(h).padStart(2,'0')}:00`,
                        forecast: r.forecast_kwh,
                        upper:    r.yhat_upper,
                        lower:    r.yhat_lower,
                    }));
                    setApiData(mapped);
                }
            })
            .catch(() => setApiData(null));
    }, [view]);

    const dailyData   = useMemo(() => apiData ?? buildDailyData(), [apiData]);
    const maxWeekDay  = WEEKLY_DATA.reduce((a, b) => b.forecast > a.forecast ? b : a);

    /* Axis / chart config per view */
    const xLabel = view === 'Daily' ? 'Hour' : view === 'Weekly' ? 'Day' : 'Week';

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">

            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">🔮 Future Forecasting</h1>
                    <p className="text-white/40 font-black tracking-tight mt-1 uppercase text-xs">Predictive insights powered by Prophet time-series model</p>
                </div>
                {/* Toggle */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                    {['Daily', 'Weekly', 'Monthly'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-6 py-2 rounded-xl text-sm font-black tracking-tight transition-all ${view === v ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-white/50 hover:text-white'}`}
                        >
                            {v.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            {/* ── Summary Banner ── */}
            <div style={{
                background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#9333ea 100%)',
                borderRadius: 24, padding: '22px 30px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
                <div className="relative flex items-start gap-4">
                    <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:14, padding:'10px 12px', flexShrink:0 }}>
                        <Activity size={26} color="#fff" />
                    </div>
                    <div>
                        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1.5, marginBottom:5 }}>
                            AI Forecast Summary
                        </p>
                        <p style={{ color:'#fff', fontSize:17, fontWeight:700, lineHeight:1.55, maxWidth:680 }}>
                            ⚡ Electricity usage is expected to{' '}
                            <span style={{ color:'#fbbf24' }}>increase by 10%</span> this week,
                            mainly due to higher AC usage during{' '}
                            <span style={{ color:'#fbbf24' }}>evening hours (8–10 PM)</span>.
                            Sunday will be the highest-consumption day.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Tag c="#fbbf24" bg="rgba(251,191,36,0.18)">📈 +10% vs last week</Tag>
                            <Tag c="#34d399" bg="rgba(52,211,153,0.18)">⏰ Peak at 8 PM</Tag>
                            <Tag c="#a78bfa" bg="rgba(167,139,250,0.18)">📅 Highest: Sunday</Tag>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Trend Indicator ── */}
            <div className="neon-card neon-border-purple neon-glow-purple p-5 flex items-center gap-8 flex-wrap">
                {/* Main trend number */}
                <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:220 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <TrendingUp size={24} color="#fff" />
                    </div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                            Trend Indicator
                        </p>
                        <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                            <span style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>+12%</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>compared to last week</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            Driven by rising AC usage this weekend
                        </p>
                    </div>
                </div>


            </div>

            {/* ── Main Forecast Chart ── */}
            <div className="neon-card neon-border-purple neon-glow-purple p-8 relative overflow-hidden">
                <div style={{ position:'absolute', top:0, right:0, width:350, height:350, background:'rgba(99,102,241,0.04)', borderRadius:'50%', filter:'blur(70px)', pointerEvents:'none' }} />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, padding:'8px 10px' }}>
                        <TrendingUp size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase">
                            {view === 'Daily'   && 'Hourly Forecast — Next 24 Hours'}
                            {view === 'Weekly'  && 'Daily Forecast — Next 7 Days'}
                            {view === 'Monthly' && `Monthly Forecast — ${currentMonthName}`}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {view === 'Daily'
                                ? 'Line chart with confidence interval'
                                : view === 'Weekly'
                                    ? 'Bar chart — highest day highlighted'
                                    : `Daily breakdown for ${currentMonthName}`}
                        </p>
                    </div>
                </div>

                <div className="h-[360px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">

                        {/* ── Daily → Line + confidence band ── */}
                        {view === 'Daily' ? (
                            <ComposedChart data={dailyData} margin={{ top:10, right:10, left:0, bottom:0 }}>
                                <defs>
                                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.22} />
                                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                    tick={{ fill:'#94a3b8', fontSize:11, fontWeight:600 }} tickMargin={10} interval={3} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill:'#94a3b8', fontSize:11 }} unit=" kWh" width={60} />
                                <Tooltip content={<LineTooltip />} />

                                {/* confidence band */}
                                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" />
                                <Area type="monotone" dataKey="lower" stroke="none" fill="white" fillOpacity={1} />

                                {/* forecast line */}
                                <Line type="monotone" dataKey="forecast"
                                    stroke="#7c3aed" strokeWidth={3.5}
                                    dot={false} activeDot={{ r:7, fill:'#7c3aed', strokeWidth:0 }} />

                                {/* 8 PM peak marker */}
                                <ReferenceLine x="20:00" stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5}
                                    label={{ value:'⚠️ Peak', position:'insideTopRight', fill:'#ef4444', fontSize:11, fontWeight:700 }} />
                            </ComposedChart>

                        ) : view === 'Weekly' ? (

                        /* ── Weekly → Bar chart ── */
                            <BarChart data={WEEKLY_DATA} barCategoryGap="35%" margin={{ top:10, right:10, left:0, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                    tick={{ fill:'#94a3b8', fontSize:12, fontWeight:700 }} tickMargin={10} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill:'#94a3b8', fontSize:11 }} unit=" kWh" width={60} />
                                <Tooltip content={<BarTooltip />} />
                                <Bar dataKey="forecast" name="Forecast" radius={[10,10,0,0]}>
                                    {WEEKLY_DATA.map((d, i) => (
                                        <Cell key={i} fill={d.label === maxWeekDay.label ? '#6366f1' : '#e0e7ff'} />
                                    ))}
                                </Bar>
                            </BarChart>

                        ) : (

                        /* ── Monthly → Stacked bar ── */
                            <BarChart data={MONTHLY_DATA} barCategoryGap="35%" margin={{ top:10, right:10, left:0, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false}
                                    tick={{ fill:'#94a3b8', fontSize:11, fontWeight:700 }} tickMargin={10} interval={view === 'Monthly' ? 2 : 0} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill:'#94a3b8', fontSize:11 }} unit=" kWh" width={60} />
                                <Tooltip content={<BarTooltip />} />
                                <Bar dataKey="peak"    name="Peak Hours"     stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
                                <Bar dataKey="offPeak" name="Off-Peak Hours" stackId="a" fill="#a5b4fc" radius={[10,10,0,0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Legend row */}
                <div className="flex flex-wrap gap-4 mt-4 px-1">
                    {view === 'Daily' && (
                        <>
                            <LDot color="#7c3aed" label="Predicted" />
                            <LDot color="#a78bfa" label="Confidence Range" shaded />
                        </>
                    )}
                    {view === 'Weekly' && (
                        <>
                            <LDot color="#6366f1" label="Highest Day" />
                            <LDot color="#e0e7ff" label="Other Days" />
                        </>
                    )}
                    {view === 'Monthly' && (
                        <>
                            <LDot color="#6366f1" label="Peak Hours" />
                            <LDot color="#a5b4fc" label="Off-Peak Hours" />
                        </>
                    )}
                </div>

                {view === 'Daily' && (
                    <div className="flex items-center gap-2 mt-3 px-1">
                        <Info size={13} className="text-slate-400" />
                        <p className="text-xs text-slate-400 font-medium">
                            Shaded region represents prediction uncertainty — wider band = higher uncertainty further in time.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Bottom row: Appliance Contribution + Cost Estimation ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Appliance Contribution */}
                <div className="neon-card neon-border-purple neon-glow-purple p-7">
                    <div className="flex items-center gap-3 mb-6">
                        <div style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', borderRadius:10, padding:'7px 9px' }}>
                            <Zap size={18} color="#fff" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Appliance Contribution (Tomorrow)</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { name:'Air Conditioner',  pct:60, kwh:'18.4', color:'#6366f1', emoji:'❄️' },
                            { name:'Refrigerator',     pct:12, kwh:'3.7',  color:'#10b981', emoji:'🧊' },
                            { name:'Washing Machine',  pct:10, kwh:'3.1',  color:'#f59e0b', emoji:'🫧' },
                            { name:'Geyser',           pct:8,  kwh:'2.5',  color:'#ef4444', emoji:'🔥' },
                            { name:'Lighting + Fan',   pct:10, kwh:'3.1',  color:'#94a3b8', emoji:'💡' },
                        ].map((a, i) => (
                            <div key={i}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text-main)' }}>{a.emoji} {a.name}</span>
                                    <span style={{ fontSize:13, fontWeight:800, color:a.color }}>
                                        {a.pct}%&nbsp;
                                        <span style={{ color:'var(--text-muted)', fontWeight:500 }}>({a.kwh} kWh)</span>
                                    </span>
                                </div>
                                <div style={{ height:8, background:'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
                                    <div style={{ width:`${a.pct}%`, height:'100%', background:a.color, borderRadius:99, transition:'width 1s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize:12, color:'#94a3b8', marginTop:14, display:'flex', alignItems:'center', gap:4 }}>
                        <Info size={12} />
                        AC will contribute <strong style={{ color:'#6366f1' }}>&nbsp;60%&nbsp;</strong> of total consumption tomorrow
                    </p>
                </div>

                {/* Cost Estimation — consolidated */}
                <div style={{
                    background: 'linear-gradient(145deg,#0f172a 0%,#1e1b4b 100%)',
                    borderRadius: 32, padding: '32px', color: '#fff',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(99,102,241,0.25)',
                }}>
                    <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, background:'rgba(99,102,241,0.15)', borderRadius:'50%', filter:'blur(40px)' }} />
                    <div style={{ position:'absolute', bottom:-30, left:30, width:120, height:120, background:'rgba(167,139,250,0.1)', borderRadius:'50%', filter:'blur(30px)' }} />

                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                        <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:12, padding:'8px 10px' }}>
                            <DollarSign size={20} color="#34d399" />
                        </div>
                        <h3 className="text-white font-black tracking-widest uppercase text-lg">Cost Estimation</h3>
                        <span style={{ marginLeft:'auto', background:'rgba(167,139,250,0.2)', color:'#c4b5fd', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>
                            Prediction Only
                        </span>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                        <CostCard label="Estimated Next Month" value="₹3,420" sub="Based on current trends" highlight />
                        <CostCard label="Next Week Bill"       value="₹845"   sub="+12% vs last week" />
                        <CostCard label="Highest Cost Day"     value="Sunday"  sub="7.2 kWh projected" />
                        <CostCard label="Peak Cost Time"       value="8 PM"    sub="Max tariff period" />
                    </div>

                    <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:7 }}>
                        <TrendingUp size={13} color="#fbbf24" />
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>
                            Figures are prediction-only and may vary with tariff changes.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}

/* ─── Helper sub-components ─── */

function Tag({ c, bg, children }) {
    return (
        <span style={{ background:bg, color:c, fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:99 }}>
            {children}
        </span>
    );
}

function LDot({ color, label, shaded }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {shaded
                ? <div style={{ width:22, height:10, background:color, opacity:0.3, borderRadius:4 }} />
                : <div style={{ width:22, height:3, background:color, borderRadius:99 }} />
            }
            <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>{label}</span>
        </div>
    );
}

function TrendStat({ label, value, color, emoji }) {
    return (
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1 }}>
                {emoji} {label}
            </p>
            <p style={{ fontSize:15, fontWeight:800, color: color }}>{value}</p>
        </div>
    );
}

function CostCard({ label, value, sub, highlight }) {
    return (
        <div style={{
            background: highlight ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
            borderRadius:16, padding:'16px 18px',
            border: highlight ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.06)',
        }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{label}</p>
            <p style={{ fontSize: highlight ? 27 : 21, fontWeight:900, color: highlight ? '#a5b4fc' : '#f8fafc' }}>{value}</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', marginTop:4 }}>{sub}</p>
        </div>
    );
}
