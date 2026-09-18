'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { CityPulseLogo } from '@/components/ui/CityPulseLogo';
import {
    User,
    Shield,
    Bell,
    PhoneCall,
    History,
    Key,
    QrCode,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Lock,
    Eye,
    EyeOff,
    MapPin,
    Award,
    Zap,
    Droplet,
    Sparkles,
    Smartphone,
    RefreshCw,
    HeartPulse,
    Radio,
} from 'lucide-react';

export default function CitizenProfilePage() {
    const { user, setAuth, accessToken, currentCity, setCity } = useAuthStore();

    // Tab state
    const [activeTab, setActiveTab] = useState<'details' | 'security' | 'alerts' | 'emergency' | 'activity'>('details');

    // Details state
    const [name, setName] = useState(user?.name || '');
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [ward, setWard] = useState('Ward 14 - Heritage Quarter');
    const [cityId, setCityId] = useState(user?.cityId || '');
    const [activeCities, setActiveCities] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsMessage, setDetailsMessage] = useState('');
    const [detailsError, setDetailsError] = useState('');

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // 2FA state simulation
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    // Notification toggles
    const [alerts, setAlerts] = useState({
        severeWeather: true,
        waterSchedule: true,
        powerOutages: true,
        garbageProximity: true,
        trafficDisruptions: false,
        smsChannel: true,
        pushChannel: true,
        emailChannel: false,
    });
    const [alertsSaved, setAlertsSaved] = useState(false);

    // Emergency info
    const [emergencyContact, setEmergencyContact] = useState({
        name: 'Pooja Choudhary',
        relation: 'Spouse',
        phone: '+91 98765 12345',
        bloodGroup: 'B+',
        organDonor: true,
    });
    const [emergencySaved, setEmergencySaved] = useState(false);
    const [sosTestTriggered, setSosTestTriggered] = useState(false);

    // Fetch initial profile & active cities
    useEffect(() => {
        if (user) {
            setName(user.name);
            setMobile(user.mobile || '');
            if (user.cityId) setCityId(user.cityId);
        }

        // Fetch active cities
        api.get('/cities/active')
            .then((res) => {
                if (res.data.success) {
                    setActiveCities(res.data.data);
                }
            })
            .catch((err) => console.error('Error fetching active cities:', err));

        // Fetch fresh profile from API
        api.get('/citizen/me')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    const data = res.data.data;
                    setName(data.name);
                    setMobile(data.mobile || '');
                    if (data.city?.id) {
                        setCityId(data.city.id);
                    }
                }
            })
            .catch((err) => console.error('Error refreshing citizen profile:', err));
    }, [user]);

    // Handle Profile details update
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setDetailsMessage('');
        setDetailsError('');
        setLoadingDetails(true);

        try {
            // Update name and mobile
            const res = await api.patch('/citizen/me', { name, mobile });

            // If city changed, update city too
            if (cityId && cityId !== user?.cityId) {
                await api.patch('/citizen/me/city', { cityId });
                const updatedCity = activeCities.find((c) => c.id === cityId);
                if (updatedCity) {
                    setCity(updatedCity);
                }
            }

            if (res.data.success) {
                setDetailsMessage('Profile and residency updated successfully!');
                setAuth({ ...user!, name, mobile, cityId }, accessToken || '');
            }
        } catch (err: any) {
            setDetailsError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Handle Password Change
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setLoadingPassword(true);
        try {
            const res = await api.patch('/citizen/me/password', {
                currentPassword,
                newPassword,
            });

            if (res.data.success) {
                setPasswordMessage('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Password update failed. Verify current password.');
        } finally {
            setLoadingPassword(false);
        }
    };

    // Copy Citizen ID
    const citizenCardId = `CP-CTZ-${(user?.id || '987654').slice(-6).toUpperCase()}`;
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    return (
        <div className="space-y-8 pb-16 max-w-5xl mx-auto">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D23] tracking-tight flex items-center gap-3">
                        Citizen Smart Identity & Profile
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                            Verified Resident
                        </span>
                    </h1>
                    <p className="text-sm text-[#7B8494] mt-1">
                        Manage your civic digital credentials, smart city residency, security, and alert preferences.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('details')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4F6BED] bg-white border border-white/80 shadow-[3px_3px_8px_rgba(163,177,198,0.35),-3px_-3px_8px_rgba(255,255,255,0.9)] hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* ── Holographic Digital Smart Citizen Card ────────────── */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl transition-all duration-300 hover:shadow-indigo-500/20"
                style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 45%, #0B1329 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                }}
            >
                {/* Holographic Glowing Light Auras */}
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    {/* Left: Card Brand & Details */}
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <CityPulseLogo variant="compact" theme="dark" size="sm" />
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                                    Digital Smart Citizen Card
                                </span>
                            </div>

                            {/* Contactless RFID Wave Symbol */}
                            <div className="flex items-center gap-1 text-slate-400">
                                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Chip & Security Seal */}
                        <div className="flex items-center gap-4">
                            {/* EMV Microchip SVG */}
                            <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-1 flex items-center justify-center shadow-inner border border-amber-300/40">
                                <div className="w-full h-full border border-amber-700/30 rounded flex items-center justify-center">
                                    <div className="w-4 h-3 border-x border-amber-800/20"></div>
                                </div>
                            </div>
                            <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
                                SECURE CITIZEN NFC
                            </span>
                        </div>

                        {/* Citizen ID Number */}
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Resident Identity Code</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-white">
                                    {citizenCardId}
                                </span>
                                <button
                                    onClick={() => copyToClipboard(citizenCardId)}
                                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                                    title="Copy Citizen ID"
                                >
                                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Citizen Name</p>
                                <p className="text-sm font-bold text-white tracking-wide uppercase truncate mt-0.5">
                                    {user?.name || 'CITIZEN RESIDENT'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Registered City</p>
                                <p className="text-sm font-semibold text-cyan-300 flex items-center gap-1 mt-0.5 truncate">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    {currentCity?.name || 'Udaipur, Rajasthan'}
                                </p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Civic Tier</p>
                                <p className="text-sm font-semibold text-amber-300 flex items-center gap-1 mt-0.5">
                                    <Award className="w-3.5 h-3.5" />
                                    Gold Civic Hero
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: QR Code & Verification Stamp */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 w-full md:w-48 text-center space-y-2">
                        {/* High-Tech QR Code SVG */}
                        <div className="p-2.5 bg-white rounded-xl shadow-md">
                            <svg className="w-24 h-24 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                                {/* Corners */}
                                <rect x="5" y="5" width="26" height="26" rx="4" />
                                <rect x="10" y="10" width="16" height="16" fill="white" />
                                <rect x="14" y="14" width="8" height="8" />

                                <rect x="69" y="5" width="26" height="26" rx="4" />
                                <rect x="74" y="10" width="16" height="16" fill="white" />
                                <rect x="78" y="14" width="8" height="8" />

                                <rect x="5" y="69" width="26" height="26" rx="4" />
                                <rect x="10" y="74" width="16" height="16" fill="white" />
                                <rect x="14" y="78" width="8" height="8" />

                                {/* Data matrix points */}
                                <rect x="36" y="10" width="8" height="8" />
                                <rect x="48" y="10" width="6" height="6" />
                                <rect x="36" y="24" width="6" height="8" />
                                <rect x="48" y="24" width="12" height="6" />

                                <rect x="12" y="38" width="6" height="12" />
                                <rect x="24" y="44" width="8" height="6" />
                                <rect x="38" y="38" width="14" height="14" />
                                <rect x="56" y="38" width="8" height="8" />
                                <rect x="68" y="38" width="12" height="12" />
                                <rect x="84" y="38" width="6" height="6" />

                                <rect x="36" y="58" width="8" height="12" />
                                <rect x="48" y="58" width="8" height="6" />
                                <rect x="60" y="58" width="16" height="6" />
                                <rect x="80" y="58" width="10" height="10" />

                                <rect x="38" y="76" width="10" height="14" />
                                <rect x="52" y="76" width="6" height="8" />
                                <rect x="64" y="76" width="14" height="6" />
                                <rect x="82" y="76" width="8" height="14" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-cyan-300 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Official City Seal
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">
                            Authorized by Municipal Administration
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Civic Karma & Contribution Metrics ─────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '6px 6px 14px rgba(163,177,198,0.4), -6px -6px 14px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7B8494] uppercase tracking-wider">Civic Karma</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#1A1D23] mt-2">850 pts</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                        <span>↑ Top 5% Contributor</span>
                    </div>
                </div>

                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '6px 6px 14px rgba(163,177,198,0.4), -6px -6px 14px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7B8494] uppercase tracking-wider">Reports Logged</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#1A1D23] mt-2">14 Issues</p>
                    <p className="text-xs text-[#7B8494] mt-1">12 successfully resolved</p>
                </div>

                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '6px 6px 14px rgba(163,177,198,0.4), -6px -6px 14px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7B8494] uppercase tracking-wider">Clean Energy</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#1A1D23] mt-2">320 kWh</p>
                    <p className="text-xs text-cyan-600 font-medium mt-1">Solar & EV Smart Charging</p>
                </div>

                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '6px 6px 14px rgba(163,177,198,0.4), -6px -6px 14px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7B8494] uppercase tracking-wider">Carbon Offset</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Droplet className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-[#1A1D23] mt-2">142 kg</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Eco commute verified</p>
                </div>
            </div>

            {/* ── Navigation Tabs ────────────────────────────────────── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
                {[
                    { id: 'details', label: 'Residency & Identity', icon: User },
                    { id: 'security', label: 'Security & 2FA', icon: Shield },
                    { id: 'alerts', label: 'Civic Alerts', icon: Bell },
                    { id: 'emergency', label: 'Emergency Info', icon: HeartPulse },
                    { id: 'activity', label: 'Civic Activity', icon: History },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                                isActive
                                    ? 'text-[#4F6BED] bg-white shadow-[3px_3px_8px_rgba(163,177,198,0.35),-3px_-3px_8px_rgba(255,255,255,0.9)] border border-white'
                                    : 'text-[#7B8494] hover:text-[#1A1D23] hover:bg-white/60'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F6BED]' : 'text-[#A8B0C0]'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── TAB 1: Residency & Identity ────────────────────────── */}
            {activeTab === 'details' && (
                <div
                    className="rounded-3xl p-6 sm:p-8"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#1A1D23]">Personal Details & Registered Residency</h2>
                        <p className="text-xs text-[#7B8494] mt-0.5">
                            Update your official resident information to receive hyper-local municipal notifications.
                        </p>
                    </div>

                    {detailsMessage && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {detailsMessage}
                        </div>
                    )}
                    {detailsError && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {detailsError}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                    pattern="[0-9]{10}"
                                    title="10-digit mobile number"
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#7B8494] uppercase tracking-wider mb-1.5">
                                    Email Address (Primary Login)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    Municipal Ward / District
                                </label>
                                <input
                                    type="text"
                                    value={ward}
                                    onChange={(e) => setWard(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    Assigned Smart City Jurisdiction
                                </label>
                                <select
                                    value={cityId}
                                    onChange={(e) => setCityId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                >
                                    <option value="" disabled>Select your resident city</option>
                                    {activeCities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            📍 {city.name}, {city.state} (Active IoT & Municipal Grid)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={loadingDetails}
                                className="px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-[#4F6BED] to-[#3D56D5] shadow-[4px_4px_12px_rgba(79,107,237,0.35)] hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loadingDetails ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    'Save Profile Details'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── TAB 2: Security & 2FA ──────────────────────────────── */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    {/* Password Change Card */}
                    <div
                        className="rounded-3xl p-6 sm:p-8"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.85)',
                        }}
                    >
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-[#1A1D23] flex items-center gap-2">
                                <Key className="w-5 h-5 text-[#4F6BED]" />
                                Password & Access Authentication
                            </h2>
                            <p className="text-xs text-[#7B8494] mt-0.5">
                                Ensure your account is safeguarded with a robust, cryptographically strong password.
                            </p>
                        </div>

                        {passwordMessage && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                {passwordMessage}
                            </div>
                        )}
                        {passwordError && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    Current Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    New Password (Min. 8 characters)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none focus:ring-2 focus:ring-[#4F6BED]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loadingPassword}
                                className="mt-2 px-6 py-3 rounded-2xl text-sm font-semibold text-[#4F6BED] bg-white border border-white/80 shadow-[4px_4px_10px_rgba(163,177,198,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loadingPassword ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    {/* Two-Factor Authentication Card */}
                    <div
                        className="rounded-3xl p-6 sm:p-8"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.85)',
                        }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-[#1A1D23] flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-600" />
                                    Two-Factor Authentication (2FA Authenticator)
                                </h3>
                                <p className="text-xs text-[#7B8494] mt-0.5">
                                    Require an authenticator app (Google Authenticator, Authy) code on new logins.
                                </p>
                            </div>

                            <button
                                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    twoFactorEnabled
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                {twoFactorEnabled ? '2FA ACTIVE ✓' : 'ENABLE 2FA'}
                            </button>
                        </div>

                        {twoFactorEnabled && (
                            <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                                <p className="font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Two-factor authentication is active on this account.
                                </p>
                                <p className="text-[11px] text-emerald-700">
                                    Backup code saved: <span className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-300">CP-2FA-7819-BETA</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Active Sessions Card */}
                    <div
                        className="rounded-3xl p-6 sm:p-8"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.85)',
                        }}
                    >
                        <h3 className="text-base font-bold text-[#1A1D23] mb-4">Active Resident Sessions</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F2F5] border border-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Smartphone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1D23]">This Browser (Active)</p>
                                        <p className="text-xs text-[#7B8494]">Next.js Web Portal • Udaipur, India</p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                                    Active Now
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB 3: Civic Alerts ────────────────────────────────── */}
            {activeTab === 'alerts' && (
                <div
                    className="rounded-3xl p-6 sm:p-8"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#1A1D23] flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#4F6BED]" />
                            Civic Alert & Push Notification Preferences
                        </h2>
                        <p className="text-xs text-[#7B8494] mt-0.5">
                            Tailor which urban alerts you receive from municipal dispatch engines in real time.
                        </p>
                    </div>

                    {alertsSaved && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Notification preferences saved successfully!
                        </div>
                    )}

                    <div className="space-y-4">
                        {[
                            {
                                key: 'severeWeather',
                                title: 'Severe Weather & Emergency Flash Alerts',
                                desc: 'High priority alerts for heavy monsoon, flash floods, or extreme heat waves.',
                            },
                            {
                                key: 'waterSchedule',
                                title: 'Water Supply Pipeline Schedule',
                                desc: 'Advance notifications 30 mins before water supply opens in your ward.',
                            },
                            {
                                key: 'powerOutages',
                                title: 'Power Grid Maintenance & Outages',
                                desc: 'Scheduled maintenance windows or transformer repairs in your zone.',
                            },
                            {
                                key: 'garbageProximity',
                                title: 'Garbage Collection Van Proximity (500m)',
                                desc: 'Live GPS alert when the waste collection vehicle enters your street.',
                            },
                            {
                                key: 'trafficDisruptions',
                                title: 'Traffic Jam & Road Diversions',
                                desc: 'Real-time AI traffic alerts for your daily commute corridor.',
                            },
                        ].map((item) => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between p-4 rounded-2xl bg-[#F0F2F5] border border-white"
                            >
                                <div className="pr-4">
                                    <p className="text-sm font-bold text-[#1A1D23]">{item.title}</p>
                                    <p className="text-xs text-[#7B8494] mt-0.5">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() =>
                                        setAlerts({ ...alerts, [item.key]: !alerts[item.key as keyof typeof alerts] })
                                    }
                                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                                        alerts[item.key as keyof typeof alerts] ? 'bg-[#4F6BED]' : 'bg-slate-300'
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                                            alerts[item.key as keyof typeof alerts] ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-[#7B8494]">Preferences sync instantly across your mobile devices.</span>
                        <button
                            onClick={() => {
                                setAlertsSaved(true);
                                setTimeout(() => setAlertsSaved(false), 3000);
                            }}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#4F6BED] to-[#3D56D5] shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
                        >
                            Save Alert Settings
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB 4: Emergency Contacts & Health ─────────────────── */}
            {activeTab === 'emergency' && (
                <div
                    className="rounded-3xl p-6 sm:p-8"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-[#1A1D23] flex items-center gap-2">
                                <HeartPulse className="w-5 h-5 text-red-500" />
                                Emergency Contact & Medical SOS Registry
                            </h2>
                            <p className="text-xs text-[#7B8494] mt-0.5">
                                Accessible by smart city paramedics and 112 emergency response during verified incidents.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setSosTestTriggered(true);
                                setTimeout(() => setSosTestTriggered(false), 4000);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                        >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Test SOS Dispatch Link
                        </button>
                    </div>

                    {sosTestTriggered && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in">
                            🚨 <strong>Simulated SOS Signal Dispatched!</strong> Primary contact & City Emergency Grid received your telemetry coordinate preview.
                        </div>
                    )}
                    {emergencySaved && (
                        <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                            ✓ Emergency health information updated in Municipal Cloud.
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                Primary Emergency Contact Name
                            </label>
                            <input
                                type="text"
                                value={emergencyContact.name}
                                onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                Relationship
                            </label>
                            <input
                                type="text"
                                value={emergencyContact.relation}
                                onChange={(e) => setEmergencyContact({ ...emergencyContact, relation: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                Contact Phone Number
                            </label>
                            <input
                                type="tel"
                                value={emergencyContact.phone}
                                onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#1A1D23] uppercase tracking-wider mb-1.5">
                                Blood Group
                            </label>
                            <select
                                value={emergencyContact.bloodGroup}
                                onChange={(e) => setEmergencyContact({ ...emergencyContact, bloodGroup: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl text-sm bg-[#F0F2F5] text-[#1A1D23] border border-white/80 shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)] outline-none"
                            >
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
                        <button
                            onClick={() => {
                                setEmergencySaved(true);
                                setTimeout(() => setEmergencySaved(false), 3000);
                            }}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md shadow-red-500/20 hover:scale-105 transition-all"
                        >
                            Save Emergency Info
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB 5: Civic Activity Timeline ─────────────────────── */}
            {activeTab === 'activity' && (
                <div
                    className="rounded-3xl p-6 sm:p-8"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '10px 10px 24px rgba(163,177,198,0.45), -10px -10px 24px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-[#1A1D23] flex items-center gap-2">
                            <History className="w-5 h-5 text-[#4F6BED]" />
                            Civic Participation & Activity Log
                        </h2>
                        <p className="text-xs text-[#7B8494] mt-0.5">
                            Track your reported municipal tickets, eco milestones, and community rewards.
                        </p>
                    </div>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {[
                            {
                                date: 'Today, 02:40 PM',
                                title: 'Streetlight Outage Resolved',
                                desc: 'Pole #SL-1048 on Fatehsagar Road repaired by municipal crew.',
                                badge: '+50 Karma Points',
                                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                            },
                            {
                                date: '16 Sep 2026, 09:15 AM',
                                title: 'EV Smart Fast-Charging Session',
                                desc: 'Charged 18 kWh at Sector 4 Municipal EV Hub.',
                                badge: '+25 Green Credits',
                                color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
                            },
                            {
                                date: '12 Sep 2026, 04:30 PM',
                                title: 'Cleanliness Issue Logged',
                                desc: 'Reported overflow at Community Waste Bin #12. Truck dispatched.',
                                badge: '+30 Karma Points',
                                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                            },
                            {
                                date: '05 Sep 2026, 11:00 AM',
                                title: 'Citizen Portal Registration',
                                desc: 'Account verified under Udaipur Municipal Corporation.',
                                badge: 'Verified Badge',
                                color: 'text-slate-600 bg-slate-100 border-slate-200',
                            },
                        ].map((act, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#4F6BED] border-2 border-white shadow-sm"></div>
                                <div className="p-4 rounded-2xl bg-[#F0F2F5] border border-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="text-sm font-bold text-[#1A1D23]">{act.title}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border self-start ${act.color}`}>
                                            {act.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#7B8494] mt-1">{act.desc}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-mono">{act.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
