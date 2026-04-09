import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Wind, Zap, Refrigerator, WashingMachine, Lightbulb, ArrowUpRight, CheckCircle, Clock, Thermometer, UtensilsCrossed, Microwave, Tv, Moon } from 'lucide-react';
import { translations } from '../translations';

const IconMap = {
  "Air Conditioner": Wind,
  "Washing Machine": WashingMachine,
  "Refrigerator": Refrigerator,
  "Water Heater": Thermometer,
  "Kitchen Appliances": UtensilsCrossed,
  "Microwave / Oven": Microwave,
  "Home Entertainment": Tv,
  "Unusual Night Activity": Moon,
  "General Usage Spike": Zap,
  "Zap": Zap
};

export default function AnomalyChart({ anomalies, language }) {
    const [timeFilter, setTimeFilter] = useState('6 months');
    const t = translations[language] || translations.English;

    const applianceTranslation = {
        "Air Conditioner": t.appliance_ac,
        "Washing Machine": t.appliance_wm,
        "Refrigerator": t.appliance_fridge,
        "Water Heater": t.appliance_heater,
        "Kitchen Appliances": t.appliance_kitchen,
        "Microwave / Oven": t.appliance_micro,
        "Home Entertainment": t.appliance_ent,
        "Unusual Night Activity": t.appliance_night,
        "General Usage Spike": t.appliance_general,
        "Zap": t.appliance_general
    };

    const filteredData = useMemo(() => {
        if (!anomalies) return [];
        const now = new Date();
        const filterMap = {
            'Day': 1,
            'Week': 7,
            'Month': 30,
            '6 months': 180
        };
        const days = filterMap[timeFilter] || 180;
        const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        
        return anomalies.filter(a => new Date(a.timestamp) >= cutoff)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [anomalies, timeFilter]);

    const spikeCount = filteredData.length;

    const majorSpikes = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => b.percentage_increase - a.percentage_increase);
        const counts = {};
        const diverseList = [];
        
        for (const spike of sorted) {
            const appliance = spike.appliance;
            counts[appliance] = (counts[appliance] || 0) + 1;
            
            if (counts[appliance] <= 2) {
              diverseList.push(spike);
            }
            if (diverseList.length >= 5) break;
        }
        
        return diverseList.length > 0 ? diverseList : sorted.slice(0, 5);
    }, [filteredData]);

    if (!anomalies || anomalies.length === 0) {
        return (
            <div className="p-20 bg-white rounded-[2.5rem] text-center border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{t.efficient_home_title}</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-3 text-lg font-medium leading-relaxed">
                    {t.efficient_home_desc}
                </p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[1.5rem] shadow-2xl border border-slate-100 min-w-[220px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-500">
                            {new Date(data.timestamp).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 leading-none">
                        {data.consumption_kwh.toFixed(1)} 
                        <span className="text-xs font-bold text-slate-400 ml-1">kWh</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-20 transition-all duration-500">
            {/* Header Banner */}
            <div className="p-10 neon-card neon-border-blue neon-glow-blue text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-blue-500/20 backdrop-blur-md p-1.5 rounded-lg border border-blue-400/30">
                            <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80">{t.activity_summary}</span>
                    </div>
                    
                    <h2 className="text-5xl font-black mb-4 tracking-tighter leading-tight drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] text-white">
                        {spikeCount} {t.spikes_detected} <br/>
                        <span className="text-white/40 italic font-black uppercase tracking-tight text-3xl">{t.in_last} {timeFilter}.</span>
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mt-8">
                        {['Day', 'Week', 'Month', '6 months'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    timeFilter === filter 
                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105' 
                                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="absolute -right-12 -bottom-12 opacity-5 rotate-12 transition-transform duration-700 group-hover:scale-110">
                    <Zap size={280} strokeWidth={1} color="#38bdf8" />
                </div>
            </div>

            {/* Spike Timeline Chart */}
            <div className="neon-card neon-border-blue neon-glow-blue p-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1 tracking-widest uppercase">{t.usage_timeline}</h3>
                        <p className="text-white/40 font-black text-xs uppercase tracking-widest">{t.monitoring_desc}</p>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-100"></div> {t.normal}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> {t.spike}
                        </div>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredData.slice(-15)} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                            <XAxis 
                                dataKey="timestamp" 
                                stroke="#e2e8f0" 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return timeFilter === 'Day' 
                                        ? date.toLocaleTimeString([], { hour: '2-digit' })
                                        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickMargin={15}
                            />
                            <YAxis 
                                stroke="#e2e8f0" 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                tickMargin={10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.4 }} />
                            <Bar dataKey="consumption_kwh" radius={[10, 10, 0, 0]} barSize={timeFilter === 'Day' ? 40 : 24}>
                                {filteredData.slice(-15).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.percentage_increase > 150 ? "#ef4444" : "#f97316"} />
                                ))}
                            </Bar>
                            <ReferenceLine y={1.2} stroke="#cbd5e1" strokeDasharray="8 8" label={{ value: t.usual_load, position: 'right', fill: '#cbd5e1', fontSize: 9, fontWeight: 900, dy: -10 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Tips Section */}
            <div className="neon-card neon-border-blue neon-glow-blue p-8">
                <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <Lightbulb className="text-amber-500 w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white tracking-widest uppercase mb-1">{t.saving_tip_title}</h4>
                        <p className="text-white/60 font-bold uppercase text-xs tracking-tight leading-relaxed">
                            "{t.saving_tip_potential} <span className="neon-text-green font-black tracking-widest">₹{spikeCount * 15}</span> {t.saving_tip_based} {timeFilter}."
                        </p>
                    </div>
                </div>
            </div>

            {/* Major Spikes Section */}
            {majorSpikes.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-white/10">
                    <h3 className="text-xl font-black text-white ml-2 tracking-widest uppercase uppercase">{t.major_spikes}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {majorSpikes.map((spike, idx) => {
                            const Icon = IconMap[spike.appliance] || Zap;
                            return (
                                <div key={idx} className="neon-card neon-border-blue neon-glow-blue p-6 hover:translate-y-[-4px] transition-all">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${spike.percentage_increase > 150 ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-white leading-tight uppercase text-sm tracking-tight">
                                                {applianceTranslation[spike.appliance] || spike.appliance} <span className="text-white/20 font-medium px-2">—</span> 
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                    {new Date(spike.timestamp).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-white tracking-widest uppercase">{spike.consumption_kwh.toFixed(1)} kWh</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-4">
                                        <Lightbulb className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="text-white/70 font-black italic leading-snug uppercase text-xs tracking-tight">{spike.tip}</p>
                                            <p className="neon-text-green font-black uppercase tracking-widest text-[10px] mt-2 font-black">{t.potential_saving}: {spike.savings}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
