import React, { useState, useEffect, useMemo } from 'react';
import { X, Sun, Moon, Zap, Tv, Info, LayoutGrid, CheckCircle2 } from 'lucide-react';

// ─── Mock ARM Data ─────────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function makeHeatmap() {
    return DAYS.map(day => ({
        day,
        hours: HOURS.map(h => {
            let base = 0.4;
            if (h >= 6 && h <= 8) base = 1.8;
            if (h >= 19 && h <= 22) base = 4.5;
            if (h >= 11 && h <= 15) base = 1.2;
            if (h >= 23 || h < 5) base = 0.25;

            if (day === 'Sat' || day === 'Sun') {
                base *= 1.35;
                if (h >= 14 && h <= 17) base += 1.5;
            }

            const noise = (Math.random() - 0.5) * 0.4;
            const val = +(Math.max(0.1, base + noise)).toFixed(2);

            let combos = ['💡 Lights'];
            if (val > 4.0) combos = ['❄️ AC', '💡 Lights', '📺 TV', '♨️ Heater'];
            else if (val > 2.5) combos = ['❄️ AC', '💡 Lights', '📺 TV'];
            else if (val > 1.5) combos = ['💡 Lights', '🌀 Fan', '📺 TV'];
            else if (val > 0.8) combos = ['💡 Lights', '🌀 Fan'];

            return { h, val, combos };
        })
    }));
}

const armCombinations = [
    { id: 'AC_LIGHTS', combo: '❄️ AC + 💡 Lights', frequency: 'Very Frequent', pct: 38, color: 'from-purple-600 to-indigo-600', detail: "This combo accounts for 38% of your weekly usage. Seen frequently during evening cooling sessions." },
    { id: 'TV_FAN', combo: '📺 TV + 🌀 Fan', frequency: 'Common', pct: 27, color: 'from-purple-400 to-fuchsia-500', detail: "Entertainment pattern. Often seen during daytime and weekend afternoons." },
    { id: 'LIGHTS_FAN', combo: '💡 Lights + 🌀 Fan', frequency: 'Common', pct: 22, color: 'from-indigo-400 to-blue-500', detail: "Your 'baseline' activity profile when moving between rooms." },
    { id: 'AC_TV', combo: '❄️ AC + 📺 TV', frequency: 'Occasional', pct: 13, color: 'from-violet-500 to-purple-500', detail: "High-intensity occasional pattern. Dominant during weekend movie nights." },
];

function getCellStyle(val) {
    const minVal = 0.1;
    const maxVal = 6.0;
    const ratio = Math.min(1, Math.max(0, (val - minVal) / (maxVal - minVal)));

    // Shift from Dark Blue (H230, S40, L15) to Bright Purple (H270, S90, L65)
    const h = 230 + (40 * ratio);
    const s = 40 + (50 * ratio);
    const l = 15 + (50 * ratio);

    return {
        backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
        boxShadow: ratio > 0.7 ? `0 0 15px hsla(${h}, ${s}%, ${l}%, 0.4)` : 'none'
    };
}

function freqBadge(f) {
    if (f === 'Very Frequent') return 'bg-purple-600 text-white';
    if (f === 'Common') return 'bg-indigo-500 text-white';
    return 'bg-slate-500 text-white';
}

function HeatCell({ cell, day, onClick }) {
    const [show, setShow] = useState(false);
    return (
        <div
            className="relative flex-1 min-w-0 rounded-[2px] cursor-pointer transition-all duration-300 hover:scale-125 hover:z-40 hover:rounded-sm hover:shadow-2xl"
            style={{
                aspectRatio: '1/1',
                ...getCellStyle(cell.val)
            }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={(e) => {
                e.stopPropagation();
                onClick({ ...cell, day });
            }}
        >
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-40 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl p-3 pointer-events-none text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cell.h}:00</span>
                        <span className="text-purple-400 font-black">{cell.val} kWh</span>
                    </div>
                    <div className="h-px bg-slate-800 my-2"></div>
                    <p className="text-[10px] text-slate-300 font-medium leading-tight">
                        {cell.combos.join(' + ')}
                    </p>
                </div>
            )}
        </div>
    );
}

const Modal = ({ isOpen, onClose, selectedCell }) => {
    if (!isOpen || !selectedCell) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Usage Details</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {selectedCell.day} • {selectedCell.h}:00 window
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="bg-purple-50 text-purple-600 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[120px] shadow-sm border border-purple-100">
                            <span className="text-4xl font-black">{selectedCell.val}</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 mt-1">kWh</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Detected Appliances</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedCell.combos.map((c, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-purple-600/5 border border-purple-600/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Zap size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">ARM Analysis</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {selectedCell.val > 4.0 ? "Critical peak detected. High intensity cooling combined with entertainment is driving major consumption during this slot."
                                : selectedCell.val > 2.5 ? "Significant activity window. Multiple secondary appliances active alongside primary lighting."
                                : selectedCell.val > 1.0 ? "Moderate baseline usage. Standard household activity during active hours."
                                : "Idle baseline usage. Minimal power detected; background load stability."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PatternAnalysisView() {
    const [selectedCell, setSelectedCell] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiHeatmap, setApiHeatmap] = useState(null);
    const [apiPatterns, setApiPatterns] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pRes = await fetch('http://localhost:8000/patterns');
                if (pRes.ok) {
                    const pJson = await pRes.json();
                    if (pJson && pJson.length > 0) {
                        const mappedPatterns = pJson.slice(0, 4).map((rule, i) => ({
                            id: `RULE_${i}`,
                            combo: rule.antecedents.join(' + ') + ' → ' + rule.consequents.join(' + '),
                            frequency: rule.confidence > 0.7 ? 'Very Frequent' : 'Common',
                            pct: Math.round(rule.support * 100),
                            color: i % 2 === 0 ? 'from-purple-600 to-indigo-600' : 'from-indigo-400 to-blue-500',
                            detail: `ARM pattern found with ${Math.round(rule.confidence * 100)}% confidence rate.`
                        }));
                        setApiPatterns(mappedPatterns);
                    }
                }

                const dRes = await fetch('http://localhost:8000/data');
                if (dRes.ok) {
                    const dJson = await dRes.json();
                    if (dJson && dJson.length > 0) {
                        const grid = DAYS.map(d => ({
                            day: d,
                            hours: HOURS.map(h => {
                                const match = dJson.find(r => {
                                    const date = new Date(r.timestamp);
                                    return date.getDay() === DAYS.indexOf(d) && date.getHours() === h;
                                });
                                return {
                                    h,
                                    val: match ? +match.consumption_kwh.toFixed(2) : 0.4,
                                    combos: match ? ['⚡ Live Data'] : ['💡 Idle']
                                };
                            })
                        }));
                        setApiHeatmap(grid);
                    }
                }
            } catch (err) {
                console.warn("Backend unavailable, using simulator patterns.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const heatmapData = useMemo(() => apiHeatmap || makeHeatmap(), [apiHeatmap]);
    const patterns = useMemo(() => apiPatterns || armCombinations, [apiPatterns]);

    const handleCellClick = (cellData) => {
        setSelectedCell(cellData);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full space-y-10 mt-4 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pattern Analysis</h1>
                <p className="text-slate-500 text-base mt-2 font-medium">Actionable behavioral insights generated by Association Rule Mining (ARM)</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Most Frequent Combo</p>
                        <p className="text-4xl mb-3">❄️ + 💡</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">AC + Lights</p>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm font-bold text-purple-700 bg-purple-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                            38% of sessions
                        </span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Peak Usage Window</p>
                        <p className="text-4xl mb-3">🕖</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">7:00 – 10:00 PM</p>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full inline-block">
                            Consistent Daily Hotspot
                        </span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4">Weekend Differential</p>
                        <p className="text-4xl mb-3">📅</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">+20% Load Spike</p>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-4 py-1.5 rounded-full inline-block">
                            Sat & Sun Evening Shift
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Centerpiece Heatmap ── */}
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 lg:p-12 relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-slate-800">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">24×7 Usage Heatmap</h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Intensity distribution across the week. Click any cell for ARM deep-dive.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Intensity Legend</span>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-medium">Low</span>
                            <div className="w-40 h-2 rounded-full overflow-hidden bg-slate-800 flex">
                                <div className="w-full h-full bg-gradient-to-r from-[#1e293b] via-[#4c1d95] to-[#a855f7]"></div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium text-purple-300">High</span>
                        </div>
                    </div>
                </div>

                <div className="cursor-default max-w-5xl mx-auto">
                    {/* Hour labels */}
                    <div className="flex gap-1 mb-3 pl-12">
                        {HOURS.map(h => (
                            <div key={h} className="flex-1 text-center text-xs text-slate-500 font-bold">{h}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    {heatmapData.map(row => (
                        <div key={row.day} className="flex items-center gap-1 mb-1">
                            <span className="w-10 shrink-0 text-xs text-slate-400 font-bold tracking-widest uppercase text-right pr-3">{row.day}</span>
                            {row.hours.map((cell, idx) => (
                                <HeatCell key={idx} cell={cell} day={row.day} onClick={handleCellClick} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Horizontal Behavioral Insights ── */}
            <div>
                <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Lifestyle Derivations</h2>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <Sun size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Morning Rush (6 AM – 9 AM)</h3>
                            <p className="text-slate-500 text-sm mt-1 leading-relaxed">Early day ARM clusters reveal high concurrency of Kitchen Appliances and Water Heaters, acting as a moderate secondary peak.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                            <Moon size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Evening Relaxation (7 PM – 10 PM)</h3>
                            <p className="text-slate-500 text-sm mt-1 leading-relaxed">The primary household hotspot. ARM rules show a 94% confidence that AC Usage coincides heavily with entertainment devices (TVs) and ambient lighting.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                            <LayoutGrid size={28} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Weekend Entertainment</h3>
                            <p className="text-slate-500 text-sm mt-1 leading-relaxed">Saturdays and Sundays exhibit an elongated cooling pattern starting mid-afternoon, extending the High-Intensity band significantly.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Frequent Combinations ── */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Associated Combinations</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Ranked by ARM Support and Confidence levels.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {patterns.map((item) => (
                        <div key={item.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-3">{item.combo}</h3>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${freqBadge(item.frequency)}`}>
                                    {item.frequency}
                                </span>
                            </div>
                            
                            <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1">
                                {item.detail}
                            </p>

                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">
                                    <span>Support</span>
                                    <span className="text-slate-800">{item.pct}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Details UI */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} selectedCell={selectedCell} />

        </div>
    );
}
