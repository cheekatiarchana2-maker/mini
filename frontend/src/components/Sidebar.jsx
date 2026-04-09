import React, { useState } from 'react';
import { Home, BarChart2, AlertCircle, Share2, Wallet, Bell, Settings, Menu, User, Lightbulb } from 'lucide-react';
import { translations } from '../translations';

export default function Sidebar({ currentView, setCurrentView, language }) {
    const [isOpen, setIsOpen] = useState(true);
    const t = translations[language] || translations.English;

    const navItems = [
        { name: 'Home', label: t.home, icon: Home },
        { name: 'Forecasting', label: t.forecasting, icon: BarChart2 },
        { name: 'Anomaly Detection', label: t.anomaly, icon: AlertCircle },
        { name: 'Pattern Analysis', label: t.patterns, icon: Share2 },
        { name: 'Finances', label: t.finances, icon: Wallet },
        { name: 'Alerts', label: t.alerts, icon: Bell }
    ];

    return (
        <div className={`${isOpen ? 'w-64' : 'w-24'} bg-slate-900/40 backdrop-blur-xl text-white flex flex-col h-screen sticky top-0 border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] py-8 overflow-hidden z-50 shrink-0 transition-all duration-300`}>

            {/* Logo Row */}
            <div className={`px-6 mb-10 flex items-center ${isOpen ? 'gap-3' : 'justify-center'} select-none`}>
                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-all flex shrink-0 border border-transparent hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <Menu size={24} />
                </div>
                {isOpen && (
                    <h1 className="text-[1.1rem] font-black tracking-widest cursor-pointer whitespace-nowrap overflow-hidden transition-all neon-text-purple uppercase" onClick={() => setCurrentView('Home')}>
                        ElectraHome
                    </h1>
                )}
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 space-y-3 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.name || (currentView === 'Cost Optimization' && item.name === 'Finances');
                    return (
                        <button
                            key={item.name}
                            onClick={() => setCurrentView(item.name)}
                            className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-bold tracking-tight transition-all relative group ${isActive 
                                ? 'bg-purple-600/20 text-white border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                                : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                                }`}
                            title={!isOpen ? item.label : ''}
                        >
                            {isActive && <div className="absolute left-[-4px] top-1/4 bottom-1/4 w-1 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
                            <Icon size={24} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                            {isOpen && <span className="whitespace-nowrap uppercase text-xs tracking-widest">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className={`px-4 mt-auto pt-6 flex flex-col gap-3 ${isOpen ? '' : 'items-center'}`}>
                <button
                    onClick={() => setCurrentView('Profile')}
                    className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-bold tracking-tight transition-all group ${currentView === 'Profile' 
                        ? 'bg-blue-600/20 text-white border border-blue-500/50 shadow-[0_0_20px_rgba(56,189,248,0.3)]' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                        }`}
                    title={!isOpen ? 'Profile' : ''}
                >
                    <User size={24} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${currentView === 'Profile' ? 'opacity-100' : 'opacity-60'}`} />
                    {isOpen && <span className="whitespace-nowrap uppercase text-xs tracking-widest">Profile</span>}
                </button>

                <button
                    onClick={() => setCurrentView('Settings')}
                    className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-bold tracking-tight transition-all group ${currentView === 'Settings' 
                        ? 'bg-purple-600/20 text-white border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                        : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                        }`}
                    title={!isOpen ? t.settings : ''}
                >
                    <Settings size={24} className={`shrink-0 transition-transform duration-300 group-hover:rotate-45 ${currentView === 'Settings' ? 'opacity-100' : 'opacity-60'}`} />
                    {isOpen && <span className="whitespace-nowrap uppercase text-xs tracking-widest">{t.settings}</span>}
                </button>
            </div>
        </div>
    );
}
