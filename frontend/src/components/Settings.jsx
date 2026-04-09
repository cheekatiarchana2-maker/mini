import React, { useState } from 'react';
import { Bell, ShieldAlert, Zap, Lightbulb, Moon, Check, Clock, Activity, Loader2, IndianRupee, Target } from 'lucide-react';
import { updateSettings } from '../api';

const Toggle = ({ enabled, setEnabled, icon: Icon, title, description, isLoading }) => (
  <div className="flex items-center justify-between p-8 neon-card neon-border-purple neon-glow-purple group relative">
    {isLoading && (
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-[32px] backdrop-blur-[1px]">
        <Loader2 className="text-purple-400 animate-spin" size={24} />
      </div>
    )}
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
      disabled={isLoading}
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
  const [loadingKey, setLoadingKey] = useState(null);

  const updateSetting = async (key, value) => {
    setLoadingKey(key);
    try {
      // Logic for system-wide vs profile-specific settings
      if (key === 'darkMode') {
        setDarkMode(value);
        await updateSettings({ dark_mode: value });
      } else if (key === 'language') {
        setLanguage(value);
        await updateSettings({ language: value });
      } else {
        // App-specific alert settings
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        // Convert camelCase to snake_case for backend if needed, 
        // but my schema matches the frontend keys mostly
        await updateSettings({ [key]: value });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setLoadingKey(null);
    }
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
              enabled={settings.dangerous_spikes} 
              setEnabled={(val) => updateSetting('dangerous_spikes', val)} 
              icon={ShieldAlert} 
              title="Dangerous Spikes" 
              description="Critical anomaly alerts (fire-risk or explosion-risk) and SMS." 
              isLoading={loadingKey === 'dangerous_spikes'}
            />
            <Toggle 
              enabled={settings.anomaly_alerts} 
              setEnabled={(val) => updateSetting('anomaly_alerts', val)} 
              icon={Zap} 
              title="Anomaly Alerts" 
              description="Non-critical anomalies (idle loads, unusual device behavior)." 
              isLoading={loadingKey === 'anomaly_alerts'}
            />
            <Toggle 
              enabled={settings.forecasting_alerts} 
              setEnabled={(val) => updateSetting('forecasting_alerts', val)} 
              icon={Activity} 
              title="Forecasting Alerts" 
              description="Alerts for upcoming bill surges or capacity breaches." 
              isLoading={loadingKey === 'forecasting_alerts'}
            />
            <Toggle 
              enabled={settings.pattern_alerts} 
              setEnabled={(val) => updateSetting('pattern_alerts', val)} 
              icon={Clock} 
              title="Pattern Inefficiency Alerts" 
              description="Urgent inefficiencies (e.g., AC left on overnight)." 
              isLoading={loadingKey === 'pattern_alerts'}
            />
            <Toggle 
              enabled={settings.cost_optimization_alerts} 
              setEnabled={(val) => updateSetting('cost_optimization_alerts', val)} 
              icon={Lightbulb} 
              title="Cost Optimization Alerts" 
              description="Efficiency suggestions (e.g., shift usage to reduce costs)." 
              isLoading={loadingKey === 'cost_optimization_alerts'}
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
            setEnabled={(val) => updateSetting('darkMode', val)} 
            icon={Moon} 
            title="Dark Mode" 
            description="Switch to a dark theme for easier night viewing." 
            isLoading={loadingKey === 'darkMode'}
          />
        </div>

        {/* Billing & Budget Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <IndianRupee className="text-purple-400 drop-shadow-[0_0_8px_currentColor]" size={22} strokeWidth={3} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Billing & Budget</h3>
          </div>
          <div className="p-8 neon-card neon-border-purple neon-glow-purple group relative">
            {loadingKey === 'monthly_budget' && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-[32px] backdrop-blur-[1px]">
                <Loader2 className="text-purple-400 animate-spin" size={24} />
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <Target size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-black text-lg text-white uppercase tracking-widest leading-none">Monthly Budget Limit</h4>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-2">Maximum target spend per month (₹).</p>
                </div>
              </div>
              <div className="relative group">
                <input 
                  type="number"
                  value={settings.monthly_budget}
                  onChange={(e) => updateSetting('monthly_budget', parseFloat(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl w-32 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center border border-white/20 shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Activity size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
