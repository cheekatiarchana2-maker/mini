import React, { useState } from 'react';
import { Home, BarChart2, AlertCircle, Share2, Wallet, Bell, Settings, Menu } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
    const [isOpen, setIsOpen] = useState(true);

    const navItems = [
        { name: 'Home', icon: Home },
        { name: 'Forecasting', icon: BarChart2 },
        { name: 'Anomaly Detection', icon: AlertCircle },
        { name: 'Pattern Analysis', icon: Share2 },
        { name: 'Finances', icon: Wallet },
        { name: 'Alerts', icon: Bell }
    ];

    return (
        <div className={`${isOpen ? 'w-64' : 'w-24'} bg-[#6b21a8] text-white flex flex-col h-screen sticky top-0 rounded-r-3xl shadow-2xl py-8 overflow-hidden z-50 shrink-0 transition-all duration-300`}>

            {/* Logo Row */}
            <div className={`px-6 mb-10 flex items-center ${isOpen ? 'gap-3' : 'justify-center'} select-none`}>
                <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-white/20 p-2 rounded-xl transition-all flex shrink-0">
                    <Menu size={24} />
                </div>
                {isOpen && (
                    <h1 className="text-[1.1rem] font-bold tracking-tight cursor-pointer whitespace-nowrap overflow-hidden transition-all" onClick={() => setCurrentView('Home')}>
                        Electra Home
                    </h1>
                )}
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 space-y-2 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.name || (currentView === 'Cost Optimization' && item.name === 'Finances');
                    return (
                        <button
                            key={item.name}
                            onClick={() => setCurrentView(item.name)}
                            className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                            title={!isOpen ? item.name : ''}
                        >
                            <Icon size={24} className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-80'}`} />
                            {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className={`px-4 mt-auto pt-6 flex flex-col ${isOpen ? '' : 'items-center'}`}>
                <button
                    onClick={() => setCurrentView('Settings')}
                    className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl font-medium transition-all ${currentView === 'Settings' ? 'bg-white/10 text-white font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                    title={!isOpen ? 'Settings' : ''}
                >
                    <Settings size={24} className="shrink-0" />
                    {isOpen && <span className="whitespace-nowrap">Settings</span>}
                </button>
            </div>
        </div>
    );
}
