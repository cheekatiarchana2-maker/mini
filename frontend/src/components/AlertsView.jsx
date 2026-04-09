import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Zap, Clock, Smartphone, ShieldAlert, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { fetchActiveAlerts } from '../api';

export default function AlertsView({ language, settings }) {
    const t = translations[language] || translations.English;
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await fetchActiveAlerts();
                setAlerts(data);
            } catch (err) {
                console.error("Failed to fetch alerts:", err);
            } finally {
                setLoading(false);
            }
        };
        loadAlerts();
    }, []);

    const dismissAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40 flex-col gap-6">
                <Loader2 size={48} className="text-rose-500 animate-spin" />
                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Scanning Household Energy Feed...</p>
            </div>
        );
    }

    // Filter categories for the UI
    const criticalAlertsList = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
    const forecastAlertsList = alerts.filter(a => a.type === 'FORECAST');
    const patternAlertsList = alerts.filter(a => a.type === 'PATTERN');
    const costOptAlertsList = alerts.filter(a => a.type === 'OPTIMIZATION');

    const hasAnyVisible = alerts.length > 0;

    return (
        <div className="w-full space-y-16 animate-in fade-in slide-in-from-right-8 duration-700 max-w-7xl mx-auto pb-24 px-4">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-rose-500/5 p-8 rounded-[32px] border border-rose-500/10">
                <div>
                    <h1 className="text-4xl font-black text-rose-500 tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-3">
                        <ShieldAlert size={36} />
                        Urgent Interventions
                    </h1>
                    <p className="text-white/40 text-sm font-black uppercase tracking-[0.2em]">Priority incidents requiring immediate household action.</p>
                </div>
                <div className="flex gap-4">
                    <div className={`${settings.dangerousSpikes ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-white/20'} px-4 py-2 border border-current opacity-60 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors`}>
                        <Smartphone size={16} /> SMS Alerts {settings.dangerousSpikes ? 'Active' : 'Disabled'}
                    </div>
                </div>
            </header>

            {!hasAnyVisible ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                    <CheckCircle2 size={64} className="text-emerald-500 mb-6 opacity-20" />
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-sm text-center px-10">
                        {(!settings.dangerousSpikes && !settings.anomalyAlerts && !settings.costOptimizationAlerts && !settings.patternAlerts) 
                            ? 'All alerts are muted in settings' 
                            : 'All Clear — No active intervention alerts detected by AI engine'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    
                    {/* 1. Critical Device Alerts & Anomaly Alerts */}
                    {criticalAlertsList.length > 0 && (
                        <div className="space-y-8">
                            <h2 className="text-sm font-black text-white/90 tracking-[0.3em] uppercase flex items-center gap-3 px-4">
                                <div className="alert-header-dot bg-rose-500 animate-pulse text-rose-500" />
                                Critical Device Alerts
                            </h2>
                            <div className="space-y-6">
                                {criticalAlertsList.map(alert => (
                                    <AlertCard 
                                        key={alert.id} 
                                        alert={alert} 
                                        onDismiss={() => dismissAlert(alert.id)}
                                        theme="red"
                                        showSms={alert.severity === 'CRITICAL' && settings.dangerousSpikes}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. Forecasting Alerts */}
                    {settings.forecastingAlerts && forecastAlertsList.length > 0 && (
                        <div className="space-y-8">
                            <h2 className="text-sm font-black text-white/90 tracking-[0.3em] uppercase flex items-center gap-3 px-4">
                                <div className="alert-header-dot bg-blue-500 text-blue-500" />
                                Forecasting Alerts
                            </h2>
                            <div className="space-y-6">
                                {forecastAlertsList.map(alert => (
                                    <AlertCard 
                                        key={alert.id} 
                                        alert={alert} 
                                        onDismiss={() => dismissAlert(alert.id)}
                                        theme="blue"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Cost Optimization Alerts */}
                    {settings.costOptimizationAlerts && costOptAlertsList.length > 0 && (
                        <div className="space-y-8">
                            <h2 className="text-sm font-black text-white/90 tracking-[0.3em] uppercase flex items-center gap-3 px-4">
                                <div className="alert-header-dot bg-emerald-500 text-emerald-500" />
                                Cost Optimization Alerts
                            </h2>
                            <div className="space-y-6">
                                {costOptAlertsList.map(alert => (
                                    <AlertCard 
                                        key={alert.id} 
                                        alert={alert} 
                                        onDismiss={() => dismissAlert(alert.id)}
                                        theme="green"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Urgent Pattern Alerts */}
                    {settings.patternAlerts && patternAlertsList.length > 0 && (
                        <div className="space-y-8">
                            <h2 className="text-sm font-black text-white/90 tracking-[0.3em] uppercase flex items-center gap-3 px-4">
                                <div className="alert-header-dot bg-purple-500 text-purple-500" />
                                Urgent Pattern Alerts
                            </h2>
                            <div className="space-y-6">
                                {patternAlertsList.map(alert => (
                                    <AlertCard 
                                        key={alert.id} 
                                        alert={alert} 
                                        onDismiss={() => dismissAlert(alert.id)}
                                        theme="purple"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}


function AlertCard({ alert, onDismiss, theme, showSms }) {
    const themeClasses = {
        red: {
            badge: 'bg-rose-500 text-white',
            impact: 'alert-impact-bar-red',
            border: 'hover:border-rose-500/20'
        },
        blue: {
            badge: 'border border-blue-500/30 text-blue-400',
            impact: 'alert-impact-bar',
            border: 'hover:border-blue-500/20'
        },
        green: {
            badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
            impact: 'alert-impact-bar-green',
            border: 'hover:border-emerald-500/20'
        },
        purple: {
            badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
            impact: 'alert-impact-bar-purple',
            border: 'hover:border-purple-500/20'
        }
    };

    const currentTheme = themeClasses[theme] || themeClasses.blue;

    return (
        <div className={`alert-card-glass ${currentTheme.border} group`}>
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h3 className="text-white font-black uppercase tracking-[0.1em] text-lg leading-tight">{alert.title}</h3>
                    {alert.appliance && (
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{alert.appliance}</p>
                    )}
                </div>
                <span className={`alert-badge ${currentTheme.badge}`}>
                    {alert.severity}
                </span>
            </div>
            
            {alert.desc && (
                <p className="text-[11px] text-white/40 font-medium leading-relaxed mb-6 italic">{alert.desc}</p>
            )}

            <div className={`mb-6 ${currentTheme.impact}`}>
                <span>{alert.time}</span>
                <span className="opacity-80">{alert.impact}</span>
            </div>

            {showSms && (
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 mb-6 w-fit uppercase tracking-widest animate-pulse">
                    <Smartphone size={12} />
                    Sent to user via SMS
                </div>
            )}

            <button 
                onClick={onDismiss}
                className="alert-dismiss-btn"
            >
                <XCircle size={14} className="opacity-50" />
                Dismiss Alert
            </button>
        </div>
    );
}

// Sub-component or logic for the checkmark icon which was used but not imported
function CheckCircle2({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
        </svg>
    )
}
