import React from 'react';

export default function PatternTable({ patterns }) {
    if (!patterns || patterns.length === 0) return <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-slate-400">No patterns found.</div>;

    return (
        <div className="p-6 bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-700 h-full overflow-hidden flex flex-col min-h-[350px]">
            <h2 className="text-xl font-bold text-white mb-4">Frequent Usage Patterns</h2>
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-5 py-4 rounded-tl-xl font-semibold tracking-wider">When this happens...</th>
                            <th className="px-5 py-4 font-semibold tracking-wider">Then this highly likely happens...</th>
                            <th className="px-5 py-4 font-semibold tracking-wider text-center">Confidence</th>
                            <th className="px-5 py-4 rounded-tr-xl font-semibold tracking-wider text-center">Lift (Strength)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {// Sort patterns by confidence descending
                            [...patterns].sort((a, b) => b.confidence - a.confidence).map((p, i) => {
                                const confRatio = p.confidence * 100;
                                const badgeColor = confRatio > 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' : confRatio > 60 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-700 text-slate-300 border-slate-600';

                                return (
                                    <tr key={i} className="hover:bg-slate-700/40 transition-colors group">
                                        <td className="px-5 py-4 font-medium text-white group-hover:text-blue-200 transition-colors">
                                            <div className="flex gap-2 flex-wrap">
                                                {p.antecedents.map(a => (
                                                    <span key={a} className="bg-slate-700 px-2.5 py-1 rounded-md text-xs border border-slate-600">{a.replace(/_active/g, '').replace(/_/g, ' ')}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-blue-300">
                                            <div className="flex gap-2 flex-wrap">
                                                {p.consequents.map(c => (
                                                    <span key={c} className="bg-blue-900/40 px-2.5 py-1 rounded-md text-xs border border-blue-800/50">{c.replace(/_active/g, '').replace(/_/g, ' ')}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                                                {confRatio.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center font-mono text-slate-400">
                                            {p.lift.toFixed(2)}x
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
