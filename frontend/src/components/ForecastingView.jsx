import React, { useState, useMemo, useEffect } from 'react';import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Sun, Lightbulb, Wind, WashingMachine, Zap, TrendingUp, Calendar, CalendarDays } from 'lucide-react';

// --- Mock Prophet-style forecast data ---
function generateData(period) {
    const base = [
        { t: 'Mon', actual: 10.2, yhat: 10.4, yhat_lower: 9.0, yhat_upper: 11.8, peak: false },
        { t: 'Tue', actual: 9.8, yhat: 10.0, yhat_lower: 8.6, yhat_upper: 11.4, peak: false },
        { t: 'Wed', actual: 13.5, yhat: 13.2, yhat_lower: 11.8, yhat_upper: 14.5, peak: true },
        { t: 'Thu', actual: 11.1, yhat: 11.3, yhat_lower: 10.0, yhat_upper: 12.5, peak: false },
        { t: 'Fri', actual: 12.0, yhat: 12.2, yhat_lower: 10.8, yhat_upper: 13.5, peak: false },
        { t: 'Sat', actual: null, yhat: 14.1, yhat_lower: 12.5, yhat_upper: 15.6, peak: true },
        { t: 'Sun', actual: null, yhat: 13.0, yhat_lower: 11.5, yhat_upper: 14.4, peak: false },
    ];
    if (period === 'Daily') {
        return ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'].map((h, i) => ({
            t: h,
            actual: i < 5 ? [1.2, 1.8, 1.5, 1.0, 1.4][i] : null,
            yhat: [1.2, 1.8, 1.5, 1.0, 1.4, 2.1, 3.2, 3.8, 2.2][i],
            yhat_lower: [0.9, 1.4, 1.1, 0.7, 1.0, 1.7, 2.6, 3.1, 1.7][i],
            yhat_upper: [1.5, 2.2, 1.9, 1.3, 1.8, 2.5, 3.8, 4.5, 2.7][i],
            peak: h === '8PM',
        }));
    }
    if (period === 'Monthly') {
        return Array.from({ length: 12 }, (_, i) => ({
            t: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            actual: i < 4 ? [340, 310, 290, 360][i] : null,
            yhat: [340, 310, 290, 360, 380, 420, 440, 430, 400, 370, 355, 345][i],
            yhat_lower: [310, 280, 260, 330, 350, 390, 410, 400, 370, 340, 325, 315][i],
            yhat_upper: [370, 340, 320, 390, 410, 450, 470, 460, 430, 400, 385, 375][i],
            peak: i === 6,
        }));
    }
    if (period === 'Yearly') {
        return Array.from({ length: 5 }, (_, i) => ({
            t: `${2021 + i}`,
            actual: i < 3 ? [3800, 3950, 4050][i] : null,
            yhat: [3800, 3950, 4050, 4200, 4150][i],
            yhat_lower: [3600, 3750, 3850, 4000, 3950][i],
            yhat_upper: [4000, 4150, 4250, 4400, 4350][i],
            peak: i === 3,
        }));
    }
    return base; // Weekly default
}

const periodMeta = {
    Daily: {
        description: "Today's usage expected: 12 kWh (~₹95). Peak between 7–9 PM due to AC + lights.",
        tip: "Tip: Set your AC to 24°C during peak hours (7–9 PM) to reduce evening load by ~15%.",
        kpis: [
            { label: 'Daily Consumption', kwh: '12 kWh', cost: '~₹95', icon: Sun, color: 'text-amber-500 bg-amber-50' },
            { label: 'Weekly Consumption', kwh: '84 kWh', cost: '~₹670', icon: Zap, color: 'text-purple-600 bg-purple-50' },
            { label: 'Next Month Projection', kwh: '360 kWh', cost: '~₹2,850', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'Next Year Projection', kwh: '4,200 kWh', cost: '~₹34,200', icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50' },
        ]
    },
    Weekly: {
        description: "This week's usage: 84 kWh (~₹670). Wednesday evening shows highest demand.",
        tip: "Tip: Run the washing machine in the morning to reduce Wednesday evening peak load.",
        kpis: [
            { label: 'Daily Consumption', kwh: '12 kWh', cost: '~₹95', icon: Sun, color: 'text-amber-500 bg-amber-50' },
            { label: 'Weekly Consumption', kwh: '84 kWh', cost: '~₹670', icon: Zap, color: 'text-purple-600 bg-purple-50' },
            { label: 'Next Month Projection', kwh: '360 kWh', cost: '~₹2,850', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'Next Year Projection', kwh: '4,200 kWh', cost: '~₹34,200', icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50' },
        ]
    },
    Monthly: {
        description: "Projected consumption: 360 kWh (~₹2,850). Slightly higher than last month due to summer cooling.",
        tip: "Tip: Use ceiling fans alongside AC to feel cooler at a higher temperature setting. Saves up to ₹300/month.",
        kpis: [
            { label: 'Daily Consumption', kwh: '12 kWh', cost: '~₹95', icon: Sun, color: 'text-amber-500 bg-amber-50' },
            { label: 'Weekly Consumption', kwh: '84 kWh', cost: '~₹670', icon: Zap, color: 'text-purple-600 bg-purple-50' },
            { label: 'Next Month Projection', kwh: '360 kWh', cost: '~₹2,850', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'Next Year Projection', kwh: '4,200 kWh', cost: '~₹34,200', icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50' },
        ]
    },
    Yearly: {
        description: "Annual projection: 4,200 kWh (~₹34,200). Efficiency score expected to improve by 5% with savings habits.",
        tip: "Tip: Switching to 5-star rated appliances can reduce your annual consumption by up to 600 kWh.",
        kpis: [
            { label: 'Daily Consumption', kwh: '12 kWh', cost: '~₹95', icon: Sun, color: 'text-amber-500 bg-amber-50' },
            { label: 'Weekly Consumption', kwh: '84 kWh', cost: '~₹670', icon: Zap, color: 'text-purple-600 bg-purple-50' },
            { label: 'Next Month Projection', kwh: '360 kWh', cost: '~₹2,850', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { label: 'Next Year Projection', kwh: '4,200 kWh', cost: '~₹34,200', icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50' },
        ]
    }
};

const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.actual === null || payload.actual === undefined) return null;
    return <circle cx={cx} cy={cy} r={5} fill="#1e293b" stroke="#fff" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const d = payload[0]?.payload;
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {d?.actual != null && <p className="text-slate-700">Actual: <span className="font-semibold">{d.actual} kWh</span></p>}
                <p className="text-blue-600">Forecast: <span className="font-semibold">{d?.yhat} kWh</span></p>
                <p className="text-slate-400 text-xs mt-1">Range: {d?.yhat_lower} – {d?.yhat_upper} kWh</p>
            </div>
        );
    }
    return null;
};

export default function ForecastingView() {
    const [period, setPeriod] = useState('Weekly');
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(false);

    const meta = periodMeta[period];

    // Fetch from backend
    useEffect(() => {
        const fetchForecast = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:8000/forecast');
                if (!res.ok) throw new Error('Backend offline');
                const json = await res.json();
                if (json && json.length > 0) {
                    // Map backend 'forecast_kwh' and 'timestamp' to 'yhat' and 't'
                    const mapped = json.map(r => ({
                        t: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        yhat: +r.forecast_kwh.toFixed(2),
                        yhat_lower: +r.yhat_lower.toFixed(2),
                        yhat_upper: +r.yhat_upper.toFixed(2),
                        actual: null, // Forecast is future-only
                        peak: r.forecast_kwh > 4.0
                    }));
                    setApiData(mapped);
                }
            } catch (err) {
                console.warn("Using mock data:", err.message);
                setApiData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, []);

    const data = useMemo(() => apiData || generateData(period), [period, apiData]);
    const peakPoints = data.filter(d => d.peak);

    return (
        <div className="w-full space-y-8 mt-4">

            {/* Sync Status Overlay */}
            {!apiData && !loading && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 text-amber-700 text-xs font-bold animate-pulse">
                    <Zap size={14} /> Model still installing or server offline — Using high-fidelity simulator data
                </div>
            )}
            {apiData && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={16} /> Live Prophet Data Synced
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {meta.kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                            <div className={`p-4 rounded-2xl shrink-0 ${kpi.color}`}>
                                <Icon size={28} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium mb-1">{kpi.label}</p>
                                <p className="text-2xl font-black text-slate-800">{kpi.kwh}</p>
                                <p className="text-slate-500 text-sm font-medium">{kpi.cost}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Chart */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 w-full">
                {/* Chart header with period selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Prophet Demand Forecast</h2>
                        <p className="text-slate-500 text-sm mt-1">Actual usage vs predicted curve with confidence interval</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${period === p ? 'bg-[#6b21a8] text-white shadow' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 mb-6 text-sm">
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow"></span> Actual Data</span>
                    <span className="flex items-center gap-2"><span className="w-8 h-0.5 bg-blue-500"></span> Forecast</span>
                    <span className="flex items-center gap-2"><span className="w-8 h-3 bg-blue-100 rounded-sm border border-blue-200"></span> Confidence Interval</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-orange-400"></span> Peak Usage</span>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="t" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 13 }} tickMargin={12} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 13 }} tickMargin={12} axisLine={false} tickLine={false} unit=" kWh" />
                            <Tooltip content={<CustomTooltip />} />

                            {/* Confidence interval band */}
                            <Area type="monotone" dataKey="yhat_upper" stroke="none" fill="url(#ciGrad)" legendType="none" />
                            <Area type="monotone" dataKey="yhat_lower" stroke="none" fill="#fff" legendType="none" />

                            {/* Forecast line */}
                            <Line type="monotone" dataKey="yhat" stroke="#3b82f6" strokeWidth={3} dot={false} name="Forecast (kWh)" activeDot={{ r: 6 }} />

                            {/* Actual data dots */}
                            <Line type="monotone" dataKey="actual" stroke="#1e293b" strokeWidth={2} dot={<CustomDot />} activeDot={{ r: 7 }} connectNulls={false} name="Actual (kWh)" />

                            {/* Peak reference lines */}
                            {peakPoints.map(pt => (
                                <ReferenceLine key={pt.t} x={pt.t} stroke="#f97316" strokeDasharray="4 4" strokeWidth={2} label={{ value: '🔆 Peak', fill: '#f97316', fontSize: 12, fontWeight: 700, position: 'insideTopRight' }} />
                            ))}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Appliance icons at the bottom for peaks */}
                <div className="flex gap-4 mt-6 flex-wrap">
                    {peakPoints.map(pt => (
                        <div key={pt.t} className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl text-sm font-semibold text-orange-700 border border-orange-200">
                            <span>🕒 {pt.t}: </span>
                            <span>💡 Lights</span>
                            <span>❄️ AC</span>
                            {period === 'Weekly' && <span>🫧 Washing Machine</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Description block */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                    <span className="w-2 h-6 rounded-full bg-purple-600 inline-block"></span>
                    {period} Summary
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">{meta.description}</p>
            </div>

            {/* Actionable Tip */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl text-purple-700 shrink-0">
                    <Lightbulb size={24} />
                </div>
                <div>
                    <p className="font-bold text-purple-800 text-base mb-1">Smart Tip</p>
                    <p className="text-purple-700 text-sm leading-relaxed">{meta.tip}</p>
                </div>
            </div>

        </div>
    );
}
