import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, AlertTriangle, Info, Zap, AirVent, Tv, Lightbulb, Clock, CheckCircle2, TrendingUp, ShieldAlert, Activity, X } from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────

const GROUPED_ALERTS = [
    {
        id: 'A1',
        tier: 'CRITICAL',
        title: 'High Capacity AC Spikes',
        appliance: 'AC',
        count: 5,
        icon: AirVent,
        timeWindow: '7:00 PM – 10:00 PM',
        costImpact: '₹175 this week',
        action: 'Shift proactive cooling to 6:00 PM and increase thermostat by 2°C during peak hours (7-9 PM).',
        detail: 'Simultaneous continuous usage of AC units at minimum temperatures has repeatedly breached your peak load thresholds.'
    },
    {
        id: 'A2',
        tier: 'WARNING',
        title: 'Idle Entertainment Devices',
        appliance: 'TV & Console',
        count: 2,
        icon: Tv,
        timeWindow: '11:00 PM – 6:00 AM',
        costImpact: '₹45 estimated waste',
        action: 'Unplug or utilize a smart power strip for your living room media center overnight.',
        detail: 'Standby mode usage detected repeatedly throughout the night. Appliances are drawing passive current.'
    },
    {
        id: 'A3',
        tier: 'CRITICAL',
        title: 'System Limit Approaching',
        appliance: 'Total Household',
        count: 1,
        icon: Zap,
        timeWindow: 'Daily Average',
        costImpact: '₹0 currently',
        action: 'Engage power-saving protocols for secondary appliances immediately.',
        detail: 'Your daily consumption has reached 88% of your predetermined 15 kWh limit today.'
    },
    {
        id: 'A4',
        tier: 'INFO',
        title: 'Daylight Optimization',
        appliance: 'Lights',
        count: 3,
        icon: Lightbulb,
        timeWindow: '12:00 PM – 4:00 PM',
        costImpact: '₹12 impact',
        action: 'Utilize natural lighting; turn off localized hallway and study lamps.',
        detail: 'Illumination usage detected during peak afternoon sunlight hours.'
    }
];

const TREND_DATA = [
    { day: 'Mon', critical: 1, warning: 1, info: 2 },
    { day: 'Tue', critical: 0, warning: 2, info: 1 },
    { day: 'Wed', critical: 3, warning: 0, info: 0 },
    { day: 'Thu', critical: 0, warning: 1, info: 1 },
    { day: 'Fri', critical: 1, warning: 0, info: 2 },
    { day: 'Sat', critical: 2, warning: 1, info: 1 },
    { day: 'Sun', critical: 0, warning: 0, info: 0 }, // Today
];

const TIER_STYLES = {
    CRITICAL: { bg: 'bg-rose-50', border: 'border-rose-100/60', text: 'text-rose-600', iconBg: 'bg-rose-100', glow: 'shadow-rose-500/20' },
    WARNING: { bg: 'bg-amber-50', border: 'border-amber-100/60', text: 'text-amber-600', iconBg: 'bg-amber-100', glow: 'shadow-amber-500/20' },
    INFO: { bg: 'bg-indigo-50', border: 'border-indigo-100/60', text: 'text-indigo-600', iconBg: 'bg-indigo-100', glow: 'shadow-indigo-500/20' }
};

// ─── Modal Overlay Component ───────────────────────────────────────────────
const MitigationModal = ({ alert, onClose, onAcknowledge }) => {
    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 pointer-events-auto" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"></div>
            
            {/* Modal Content */}
            <div 
                className="relative bg-slate-900 rounded-[2.5rem] w-full max-w-3xl max-h-full overflow-y-auto shadow-2xl border border-slate-800 animate-in fade-in zoom-in-[0.97] slide-in-from-bottom-8 duration-300 custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent Glow */}
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none transition-colors duration-500 ${TIER_STYLES[alert.tier].bg}`}></div>

                <div className="p-8 sm:p-10">
                    <button 
                        onClick={onClose} 
                        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors z-20 backdrop-blur-md"
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 relative z-10">
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 border-2 shadow-2xl ${TIER_STYLES[alert.tier].bg} ${TIER_STYLES[alert.tier].text} ${TIER_STYLES[alert.tier].border} ${TIER_STYLES[alert.tier].glow}`}>
                            <alert.icon size={48} strokeWidth={2} />
                        </div>
                        <div className="pt-2">
                            <span className={`inline-block px-3 py-1 mb-3 rounded-lg text-[10px] font-black uppercase tracking-widest border ${TIER_STYLES[alert.tier].text} border-[currentColor] opacity-90`}>
                                {alert.tier} SEVERITY
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{alert.title}</h2>
                        </div>
                    </div>

                    {/* Context Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 relative z-10">
                        <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl shrink-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Tv size={14}/> Appliances</p>
                            <p className="text-base font-bold text-slate-200">{alert.appliance}</p>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl shrink-0">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={14}/> Time Window</p>
                            <p className="text-base font-bold text-slate-200">{alert.timeWindow}</p>
                        </div>
                        <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl shrink-0">
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={14}/> Impact</p>
                            <p className="text-base font-black text-white">{alert.costImpact}</p>
                        </div>
                    </div>

                    {/* ARM Mitigation Action */}
                    <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border border-purple-500/40 rounded-[2rem] p-8 sm:p-10 mb-8 relative z-10 shadow-lg shadow-purple-900/20">
                        <div className="flex items-center gap-3 mb-5 text-purple-300">
                            <Zap size={24} className="stroke-[2.5px]" />
                            <h3 className="text-sm font-black uppercase tracking-widest">ARM Suggested Mitigation</h3>
                        </div>
                        <p className="text-xl font-bold text-white leading-relaxed text-balance">
                            "{alert.action}"
                        </p>
                    </div>

                    <div className="relative z-10 bg-slate-800/40 p-6 rounded-3xl border border-slate-800">
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            <span className="font-bold text-slate-100 uppercase tracking-wide text-[11px] mr-2">Context:</span> {alert.detail}
                        </p>
                    </div>

                    {/* Final Actions */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
                        <button 
                            onClick={() => onAcknowledge(alert.id)}
                            className="flex-1 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-purple-900/50 active:scale-[0.98]"
                        >
                            Acknowledge & Save Strategy
                        </button>
                        <button 
                            onClick={onClose}
                            className="py-5 px-10 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-lg rounded-2xl transition-all active:scale-[0.98]"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function AlertsView() {
    const [alertsList, setAlertsList] = useState(GROUPED_ALERTS);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [animatedScore, setAnimatedScore] = useState(100);

    const criticalCount = alertsList.filter(a => a.tier === 'CRITICAL').reduce((sum, a) => sum + a.count, 0);
    const warningCount = alertsList.filter(a => a.tier === 'WARNING').reduce((sum, a) => sum + a.count, 0);
    const infoCount = alertsList.filter(a => a.tier === 'INFO').reduce((sum, a) => sum + a.count, 0);
    
    const targetScore = Math.max(0, 100 - (criticalCount * 5) - (warningCount * 2));

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(targetScore);
        }, 300);
        return () => clearTimeout(timer);
    }, [targetScore]);

    const handleAcknowledge = (id) => {
        // Implement save logic here / remove from list if you want it to act as resolved
        setAlertsList(alertsList.filter(a => a.id !== id));
        setSelectedAlert(null);
    };

    return (
        <div className="relative w-full mt-4 max-w-6xl mx-auto pb-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Alerts Center</h1>
                <p className="text-slate-500 text-base mt-2 font-medium">Prioritized household anomalies and ARM-backed mitigation strategies.</p>
            </div>

            {/* ── Top Summary Card ── */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-10 overflow-hidden relative group transition-all">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-50 rounded-full blur-[80px] opacity-70 -translate-y-1/2 translate-x-1/4 pointer-events-none transition-all duration-700 group-hover:bg-purple-100/80"></div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 relative z-10 items-center">
                    
                    {/* Energy Health Score */}
                    <div className="col-span-1 md:col-span-2 flex items-center gap-8 pr-4 lg:pr-8 md:border-r border-slate-100">
                        <div className="relative shrink-0">
                            <svg className="w-28 h-28 transform -rotate-90">
                                <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                                <circle 
                                    cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" 
                                    strokeDasharray="301.59" 
                                    strokeDashoffset={301.59 - (301.59 * animatedScore) / 100}
                                    className={`transition-all duration-1000 ease-out ${animatedScore > 80 ? 'text-emerald-500' : animatedScore > 60 ? 'text-amber-500' : 'text-rose-500'}`} 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-800">{animatedScore}</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Energy Health</h2>
                            <p className="text-xl font-bold text-slate-800 leading-tight">
                                {animatedScore > 80 ? 'Excellent Efficiency' : animatedScore > 60 ? 'Needs Optimization' : 'Critical Interventions Needed'}
                            </p>
                            <p className="text-[10px] font-bold text-rose-500 mt-2 bg-rose-50 px-3 py-1.5 rounded-lg inline-block uppercase tracking-wider">
                                {criticalCount * 5} pt penalty from critical spikes
                            </p>
                        </div>
                    </div>

                    {/* Tier Counts */}
                    <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4 lg:gap-8">
                        <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-50/50 hover:bg-rose-50 rounded-3xl border border-rose-100/50 transition-colors">
                            <ShieldAlert className="text-rose-500 mb-3" size={28} />
                            <span className="text-3xl font-black text-rose-600 leading-none mb-2">{criticalCount}</span>
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Critical</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-6 bg-amber-50/50 hover:bg-amber-50 rounded-3xl border border-amber-100/50 transition-colors">
                            <AlertTriangle className="text-amber-500 mb-3" size={28} />
                            <span className="text-3xl font-black text-amber-600 leading-none mb-2">{warningCount}</span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Warnings</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-6 bg-indigo-50/50 hover:bg-indigo-50 rounded-3xl border border-indigo-100/50 transition-colors">
                            <Info className="text-indigo-500 mb-3" size={28} />
                            <span className="text-3xl font-black text-indigo-600 leading-none mb-2">{infoCount}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Information</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Feed ── */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Incidents</h2>
                    <span className="text-sm font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full">{alertsList.length} Clusters Pending</span>
                </div>
                
                {alertsList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {alertsList.map(alert => {
                            const style = TIER_STYLES[alert.tier];
                            return (
                                <div
                                    key={alert.id}
                                    onClick={() => setSelectedAlert(alert)}
                                    className={`p-6 bg-white rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 border-slate-100 hover:border-purple-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 group`}
                                >
                                    <div className="flex gap-5 items-start mb-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${style.iconBg} ${style.text}`}>
                                            <alert.icon size={26} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${style.text} ${style.bg} border ${style.border}`}>
                                                    {alert.tier}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-purple-600 transition-colors">{alert.title}</h3>
                                        </div>
                                    </div>

                                    <div className="mt-auto border-t border-slate-50 pt-4 flex items-center justify-between">
                                        <p className="text-slate-500 text-sm font-semibold truncate px-2">{alert.appliance}</p>
                                        <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                            {alert.count} Events
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="w-full border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-16 bg-slate-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-400 mb-6 border border-slate-100">
                            <CheckCircle2 size={48} strokeWidth={2} />
                        </div>
                        <p className="text-2xl font-black text-slate-800 mb-2 tracking-tight">All Clear!</p>
                        <p className="text-slate-500 font-medium text-center">No structural alerts detected. Your household is running efficiently.</p>
                    </div>
                )}
            </div>

            {/* ── Bottom Trends Chart ── */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-12 mb-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Weekly Incident Volume</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Historical breakdown of aggregated household alerts over the past 7 days.</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-6 items-center">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Critical</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Warning</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Info</span></div>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TREND_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} tickMargin={16} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickMargin={16} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '16px 20px', backgroundColor: '#1e293b', color: 'white' }}
                                itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                                labelStyle={{ color: '#94a3b8', fontWeight: 800, marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            />
                            
                            <Area type="monotone" dataKey="info" name="Informational" stackId="1" stroke="#6366f1" strokeWidth={3} fill="url(#colorInfo)" />
                            <Area type="monotone" dataKey="warning" name="Warnings" stackId="1" stroke="#fbbf24" strokeWidth={3} fill="url(#colorWarning)" />
                            <Area type="monotone" dataKey="critical" name="Critical Events" stackId="1" stroke="#f43f5e" strokeWidth={3} fill="url(#colorCritical)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Floating Drawer / Modal Overlay */}
            {selectedAlert && (
                <MitigationModal 
                    alert={selectedAlert} 
                    onClose={() => setSelectedAlert(null)} 
                    onAcknowledge={handleAcknowledge}
                />
            )}
        </div>
    );
}
