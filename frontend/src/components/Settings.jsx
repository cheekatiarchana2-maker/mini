import React, { useState } from 'react';
import { Bell, ShieldAlert, Zap, Lightbulb, Moon, Check, Clock, Activity } from 'lucide-react';

const Toggle = ({ enabled, setEnabled, icon: Icon, title, description, isDarkMode }) => (
  <div className="flex items-center justify-between p-8 neon-card neon-border-purple neon-glow-purple group">
    <div className="flex items-center gap-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${enabled ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-white/20 border border-white/10'}`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="font-black text-lg text-white uppercase tracking-widest leading-none">{title}</h4>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-2">{description}</p>
      </div>
    </div>
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`w-16 h-9 rounded-full relative transition-all duration-300 ease-in-out border border-white/10 ${
        enabled 
          ? 'bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
          : 'bg-white/5'
      }`}
    >
      <div className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-[0_0_10px_#fff] transition-transform duration-300 ${enabled ? 'translate-x-7' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default function Settings({ language, setLanguage, darkMode, setDarkMode, settings, setSettings }) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 pt-10 px-4">
      {/* Header section */}
      <div>
        <h1 className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">APP SETTINGS</h1>
        <p className="text-white/40 text-xl font-black uppercase tracking-widest leading-tight">Customize your ElectraHome experience</p>
      </div>

      <div className="grid grid-cols-1 gap-16">
        {/* Notification Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Bell className="text-purple-400 drop-shadow-[0_0_8px_currentColor]" size={22} strokeWidth={3} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Notifications & Alerts</h3>
          </div>
          
          <div className="space-y-5">
            <Toggle 
              enabled={settings.dangerousSpikes} 
              setEnabled={(val) => updateSetting('dangerousSpikes', val)} 
              icon={ShieldAlert} 
              title="Dangerous Spikes" 
              description="Critical anomaly alerts (fire-risk or explosion-risk) and SMS." 
            />
            <Toggle 
              enabled={settings.anomalyAlerts} 
              setEnabled={(val) => updateSetting('anomalyAlerts', val)} 
              icon={Zap} 
              title="Anomaly Alerts" 
              description="Non-critical anomalies (idle loads, unusual device behavior)." 
            />
            <Toggle 
              enabled={settings.forecastingAlerts} 
              setEnabled={(val) => updateSetting('forecastingAlerts', val)} 
              icon={Activity} 
              title="Forecasting Alerts" 
              description="Alerts for upcoming bill surges or capacity breaches." 
            />
            <Toggle 
              enabled={settings.patternAlerts} 
              setEnabled={(val) => updateSetting('patternAlerts', val)} 
              icon={Clock} 
              title="Pattern Inefficiency Alerts" 
              description="Urgent inefficiencies (e.g., AC left on overnight)." 
            />
            <Toggle 
              enabled={settings.costOptimizationAlerts} 
              setEnabled={(val) => updateSetting('costOptimizationAlerts', val)} 
              icon={Lightbulb} 
              title="Cost Optimization Alerts" 
              description="Efficiency suggestions (e.g., shift usage to reduce costs)." 
            />
          </div>
        </div>

        {/* Display System Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Moon className="text-purple-400 drop-shadow-[0_0_8px_currentColor]" size={22} strokeWidth={3} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Display System</h3>
          </div>
          <Toggle 
            enabled={darkMode} 
            setEnabled={setDarkMode} 
            icon={Moon} 
            title="Dark Mode" 
            description="Switch to a dark theme for easier night viewing." 
          />
        </div>
      </div>
    </div>
  );
}
