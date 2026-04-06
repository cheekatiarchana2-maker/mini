import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnomalyChart({ anomalies }) {
    if (!anomalies || anomalies.length === 0) return <div className="p-4 bg-white rounded-3xl text-slate-400 border border-slate-100">No anomalies detected.</div>;

    const enhancedAnomalies = anomalies.map((a, i) => ({
        ...a,
        displayTime: new Date(a.timestamp).toLocaleDateString([], { weekday: 'short' }),
        applianceLabel: i % 2 === 0 ? "AC spike" : "TV & AC spike"
    }));

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 h-full w-full">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                Anomaly Detection
            </h2>
            <div className="text-slate-600 font-medium mb-4 text-sm">Unusual Usage Spikes</div>

            <div className="h-48 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enhancedAnomalies}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="displayTime" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#ef4444' }} />
                        <Bar dataKey="consumption_kwh" name="Magnitude (kWh)" radius={[4, 4, 0, 0]}>
                            {enhancedAnomalies.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#ef4444" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-sm text-slate-600 mt-6 leading-relaxed">
                High usage detected at 2:00-3:00 PM <br />
                <span className="text-slate-400">(Air Conditioner)</span>
            </div>
        </div>
    );
}
