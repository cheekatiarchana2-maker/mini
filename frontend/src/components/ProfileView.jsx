import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, LogOut, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { fetchProfile, updateProfile } from '../api';

export default function ProfileView({ onSignOut }) {
    const [user, setUser] = useState({ email: '', phone: '', username: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [saveStatus, setSaveStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load profile from backend on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await fetchProfile();
                setUser(profile);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        try {
            const updates = {};
            if (user.email) updates.email = user.email;
            if (user.phone !== undefined) updates.phone = user.phone;
            if (showPasswordChange && newPassword) updates.password = newPassword;

            const updatedUser = await updateProfile(updates);
            setUser(updatedUser);
            setIsEditing(false);
            setShowPasswordChange(false);
            setNewPassword('');
            setSaveStatus(true);
            setError('');
            setTimeout(() => setSaveStatus(false), 3000);
        } catch (err) {
            const detail = err.response?.data?.detail || 'Failed to update profile.';
            setError(detail);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('electra_token');
        onSignOut();
    };

    const displayName = user.username || (user.email ? user.email.split('@')[0] : 'User');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="text-slate-400 font-bold animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-16">

            {/* Page Heading */}
            <div className="pt-10 pb-8 text-center">
                <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    USER PROFILE
                </h1>
                <p className="text-white/40 text-sm font-black uppercase tracking-[0.25em] mt-2">
                    Manage Your Account and Security
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 px-6 py-4 rounded-2xl border bg-rose-500/10 border-rose-500/50 text-rose-400 text-sm font-black uppercase tracking-widest text-center animate-in fade-in">
                    {error}
                </div>
            )}

            {/* Main Vertical Rectangle Box */}
            <div className="neon-card neon-border-purple neon-glow-purple flex flex-col items-center gap-0 overflow-hidden">

                {/* ── Avatar Section ── */}
                <div className="w-full flex flex-col items-center gap-6 px-14 pt-16 pb-12 border-b border-white/5">
                    {/* Circular Icon */}
                    <div className="w-36 h-36 rounded-full bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.35)] relative">
                        <User size={68} className="text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                        <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
                    </div>

                    {/* Name */}
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest">
                            {displayName}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <ShieldCheck size={11} className="text-purple-400" />
                            <p className="text-[10px] font-black text-purple-400/70 uppercase tracking-[0.2em]">
                                Energy Consumer ID: EH-{user.id ? String(user.id).padStart(4, '0') : '0000'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Account Details Section ── */}
                <div className="w-full px-14 py-10 border-b border-white/5 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.2em]">Account Details</h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors border-b border-blue-400/30 pb-0.5"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={16} />
                            <input
                                type="email"
                                value={user.email}
                                disabled={!isEditing}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                className={`w-full pl-12 neon-input text-sm ${isEditing ? 'neon-input-blue' : 'opacity-60 cursor-not-allowed'}`}
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={16} />
                            <input
                                type="tel"
                                value={user.phone || ''}
                                disabled={!isEditing}
                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                className={`w-full pl-12 neon-input text-sm ${isEditing ? 'neon-input-blue' : 'opacity-60 cursor-not-allowed'}`}
                            />
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="pt-2 border-t border-white/5">
                        <button
                            onClick={() => setShowPasswordChange(!showPasswordChange)}
                            className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            <Lock size={12} />
                            {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
                        </button>

                        {showPasswordChange && (
                            <div className="mt-5 space-y-2 animate-in slide-in-from-top-4 duration-300">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={16} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full pl-12 neon-input neon-input-blue text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save / Cancel */}
                    {isEditing && (
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                className="flex-1 btn-neon btn-neon-blue flex items-center justify-center gap-2 text-sm"
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setShowPasswordChange(false); }}
                                className="px-6 py-3 rounded-xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Save Status */}
                    {saveStatus && (
                        <div className="flex items-center justify-center gap-2 text-green-400 font-black uppercase tracking-widest text-xs animate-in fade-in slide-in-from-bottom-2 mt-2">
                            <CheckCircle2 size={14} />
                            Profile Updated Successfully
                        </div>
                    )}
                </div>

                {/* ── Sign Out Section ── */}
                <div className="w-full px-14 py-10">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-black uppercase tracking-widest text-sm hover:bg-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </div>

            </div>
        </div>
    );
}
