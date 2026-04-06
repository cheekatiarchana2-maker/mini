import React from 'react';
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export default function AlertsCarousel() {
    return (
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                Alerts
            </h2>

            <div className="space-y-6">
                <div className="flex gap-4 items-start">
                    <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-600">
                        High usage detected at 2:00-3:00 PM <br />
                        <span className="text-slate-400">(Air Conditioner)</span>
                    </div>
                </div>

                <div className="flex gap-4 items-start">
                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-600">
                        Usage back to normal in Afternoon
                    </div>
                </div>

                <div className="flex gap-4 items-start">
                    <Lightbulb size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-600">
                        Evening habit: Lights + TV often used together
                    </div>
                </div>
            </div>
        </div>
    );
}
