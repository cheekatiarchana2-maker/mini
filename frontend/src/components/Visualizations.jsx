import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const applianceData = [
    { name: 'AC', value: 45, color: '#3b82f6' },
    { name: 'TV', value: 20, color: '#10b981' },
    { name: 'Washing Machine', value: 15, color: '#f59e0b' },
    { name: 'Refrigerator', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 8, color: '#64748b' },
];

const hourlyData = [
    { hour: '00:00', usage: 1.2 }, { hour: '04:00', usage: 0.8 },
    { hour: '08:00', usage: 2.5 }, { hour: '12:00', usage: 3.1 },
    { hour: '16:00', usage: 3.5 }, { hour: '20:00', usage: 6.8 },
    { hour: '23:00', usage: 4.2 }
];

export default function Visualizations() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-4">Appliance Breakdown</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={applianceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {applianceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-6 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-white mb-4">Hourly Usage Trend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Usage (kWh)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
