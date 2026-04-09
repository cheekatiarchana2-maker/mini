import React, { useState, useEffect } from 'react';
import { Mail, Lock, Phone, CheckCircle2, Zap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import EnergyBackground from './EnergyBackground';

export default function AuthPage({ onAuthSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [consent, setConsent] = useState(false);
    
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Handle Signup
    const handleSignup = () => {
        if (!email || !password || !phone) {
            setStatusMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }
        if (!consent) {
            setStatusMessage({ type: 'error', text: 'Please agree to received alerts.' });
            return;
        }

        const userData = { email, password, phone };
        localStorage.setItem('electra_user', JSON.stringify(userData));
        
        setStatusMessage({ type: 'success', text: 'Account created successfully. Please log in to continue.' });
        
        // Clear fields and switch to login after delay
        setTimeout(() => {
            setMode('login');
            setStatusMessage({ type: '', text: '' });
            setPassword(''); // Clear password for security
        }, 2500);
    };

    // Handle Login
    const handleLogin = () => {
        const storedUser = JSON.parse(localStorage.getItem('electra_user'));

        if (!storedUser) {
            setStatusMessage({ type: 'error', text: 'No account found. Please sign up first.' });
            return;
        }

        if (email === storedUser.email && password === storedUser.password) {
            setStatusMessage({ type: 'success', text: 'Login successful. Accessing dashboard...' });
            setTimeout(() => onAuthSuccess(), 1000);
        } else {
            setStatusMessage({ type: 'error', text: 'Invalid email or password.' });
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <EnergyBackground />
            
            {/* ── Header ── */}
            <div className="relative z-10 text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    Welcome to ElectraHome
                </h1>
                <p className="text-white/60 text-lg md:text-xl font-medium tracking-tight">
                    Sign in or create your account to continue.
                </p>
            </div>

            {/* ── Status Message ── */}
            {statusMessage.text && (
                <div className={`relative z-20 mb-6 px-6 py-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                    statusMessage.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                        : 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                }`}>
                    {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-black uppercase tracking-widest">{statusMessage.text}</span>
                </div>
            )}

            {/* ── Main Square Container ── */}
            <div className={`relative z-10 w-full max-w-md neon-card transition-all duration-500 animate-in fade-in zoom-in duration-700 ${
                mode === 'signup' ? 'neon-border-blue neon-glow-blue' : 'neon-border-purple neon-glow-purple'
            }`}>
                
                {/* ── Toggle Header ── */}
                <div className="flex border-b border-white/10">
                    <button 
                        onClick={() => { setMode('signup'); setStatusMessage({ type: '', text: '' }); }}
                        className={`flex-1 py-6 font-black uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden ${
                            mode === 'signup' ? 'text-blue-400' : 'text-white/20 hover:text-white/40'
                        }`}
                    >
                        Sign Up
                        {mode === 'signup' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />}
                    </button>
                    <button 
                        onClick={() => { setMode('login'); setStatusMessage({ type: '', text: '' }); }}
                        className={`flex-1 py-6 font-black uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden ${
                            mode === 'login' ? 'text-purple-400' : 'text-white/20 hover:text-white/40'
                        }`}
                    >
                        Login
                        {mode === 'login' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
                    </button>
                </div>

                {/* ── Form Content ── */}
                <div className="p-10 relative overflow-hidden">
                    <div className="transition-all duration-500 ease-in-out">
                        
                        {mode === 'signup' ? (
                            <div className="flex flex-col gap-5 animate-in slide-in-from-left-8 duration-500">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors z-20" size={18} />
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com" 
                                            className="w-full pl-14 neon-input neon-input-blue relative z-10" 
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Create Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors z-20" size={18} />
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="w-full pl-14 pr-12 neon-input neon-input-blue relative z-10" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors z-20 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400 transition-colors z-20" size={18} />
                                        <input 
                                            type="tel" 
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 00000 00000" 
                                            className="w-full pl-14 neon-input neon-input-blue relative z-10" 
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group mt-2">
                                    <input 
                                        type="checkbox" 
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="neon-checkbox" 
                                    />
                                    <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">I agree to receive energy alerts via SMS</span>
                                </label>

                                <button onClick={handleSignup} className="btn-neon btn-neon-blue mt-4 flex items-center justify-center gap-2 group">
                                    Create Account
                                    <CheckCircle2 size={18} className="transition-transform group-hover:scale-110" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5 animate-in slide-in-from-right-8 duration-500">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors z-20" size={18} />
                                        <input 
                                            type="text" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com" 
                                            className="w-full pl-14 neon-input relative z-10" 
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors z-20" size={18} />
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className="w-full pl-14 pr-12 neon-input relative z-10" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors z-20 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end -mt-2">
                                    <button className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors">
                                        Forgot Password?
                                    </button>
                                </div>

                                <button onClick={handleLogin} className="btn-neon btn-neon-purple mt-8 flex items-center justify-center gap-2 group">
                                    Access Dashboard
                                    <Zap size={18} className="transition-transform group-hover:scale-110" />
                                </button>
                            </div>
                        )}

                    </div>
                </div>

            </div>

        </div>
    );
}
