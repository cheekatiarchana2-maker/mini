import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

export default function ForecastChart({ historical, forecast }) {
    const [timeframe, setTimeframe] = useState('Next Week');

    const data = React.useMemo(() => {
        let combined = [...(historical || []).map(d => ({ ...d, type: 'actual' })), ...(forecast || []).map(d => ({ ...d, type: 'forecast' }))];
        if (timeframe === 'Next Day' && combined.length > 24) combined = combined.slice(-24);
        else if (timeframe === 'Next Week' && combined.length > 168) combined = combined.slice(-168);
        return combined;
    }, [historical, forecast, timeframe]);

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[350px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Forecasting</h2>
                <div className="relative">
                    <select
                        className="appearance-none bg-indigo-50/50 border border-indigo-100 text-indigo-700 py-1.5 pl-4 pr-9 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                    >
                        <option>Next Day</option>
                        <option>Next Week</option>
                        <option>Next Month</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                </div>
            </div>

            <h3 className="text-indigo-600 font-semibold mb-6">Weekly Usage Prediction</h3>

            <div className="flex-1 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="timestamp" stroke="#94a3b8" tickFormatter={val => new Date(val).toLocaleDateString([], { weekday: 'short' })} tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#334155' }} />
                        <Area type="monotone" dataKey="consumption_kwh" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center text-sm font-medium text-slate-500 mt-4">
                Peak usage expected on Wednesday evening
            </div>
        </div>
    );
}
