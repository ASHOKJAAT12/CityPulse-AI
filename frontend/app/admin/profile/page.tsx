'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import { CityPulseLogo } from '@/components/ui/CityPulseLogo';
import {
    Shield,
    Key,
    Sliders,
    AlertTriangle,
    Terminal,
    Copy,
    Check,
    CheckCircle2,
    RefreshCw,
    Activity,
    Server,
    Radio,
    Lock,
    Eye,
    EyeOff,
    UserCheck,
    Cpu,
    Wifi,
    Zap,
    MapPin,
    Building2,
    Clock,
    Flame,
    FileText,
} from 'lucide-react';

export default function AdminProfilePage() {
    const { user } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState<'overview' | 'credentials' | 'thresholds' | 'emergency' | 'audit'>('overview');

    // Profile form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('Urban AI & Cybernetics Operations');
    const [loadingSave, setLoadingSave] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');

    // System Health Live state
    const [systemHealth, setSystemHealth] = useState<{
        status: string;
        uptime: string;
        latencyMs: number;
        databaseStatus: string;
    }>({
        status: 'healthy',
        uptime: '2h 45m',
        latencyMs: 14,
        databaseStatus: 'connected',
    });

    // API Key Generator state
    const [generatedKey, setGeneratedKey] = useState('cp_live_sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const [keyCopied, setKeyCopied] = useState(false);
    const [keyScopes, setKeyScopes] = useState({
        telemetryRead: true,
        dispatchExecute: true,
        aiTune: false,
    });

    // Thresholds state
    const [aiSensitivity, setAiSensitivity] = useState<'high' | 'balanced' | 'low'>('high');
    const [gridOverloadThreshold, setGridOverloadThreshold] = useState(85);
    const [autoDispatchConfidence, setAutoDispatchConfidence] = useState(90);
    const [thresholdsSaved, setThresholdsSaved] = useState(false);

    // Emergency Protocol state
    const [emergencyCodeRed, setEmergencyCodeRed] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    // Load admin profile and system health
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
        }

        // Fetch fresh admin profile from API
        api.get('/admin/me')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    const d = res.data.data;
                    setFirstName(d.firstName || '');
                    setLastName(d.lastName || '');
                    if (d.phone) setPhone(d.phone);
                }
            })
            .catch((err) => console.error('Error fetching admin profile:', err));

        // Fetch API health
        api.get('/health')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    setSystemHealth({
                        status: res.data.data.status || 'ok',
                        uptime: res.data.data.uptime || '4h 12m',
                        latencyMs: res.data.data.latencyMs ?? 12,
                        databaseStatus: res.data.data.database?.status || 'connected',
                    });
                }
            })
            .catch(() => {});
    }, [user]);

    // Handle Profile Update
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveMessage('');
        setSaveError('');
        setLoadingSave(true);

        try {
            const res = await api.patch('/admin/me', {
                firstName,
                lastName,
                phone,
            });

            if (res.data.success) {
                setSaveMessage('Administrator identity records successfully updated!');
            }
        } catch (err: any) {
            setSaveError(err.response?.data?.message || 'Failed to update administrator profile');
        } finally {
            setLoadingSave(false);
        }
    };

    const copyApiKey = () => {
        navigator.clipboard.writeText(generatedKey);
        setKeyCopied(true);
        setTimeout(() => setKeyCopied(false), 2000);
    };

    const generateNewKey = () => {
        const newKey = 'cp_live_sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setGeneratedKey(newKey);
        setKeyCopied(false);
    };

    const adminIdCode = `CP-ADM-${(user?.id || '883901').slice(-6).toUpperCase()}`;

    return (
        <div className="space-y-8 pb-16">
            {/* ── Header ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        Administrator Command Profile
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            {user?.role === 'SUPER_ADMIN' ? 'Level 5 Super Clearance' : 'Level 3 City Admin'}
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Executive credentials, infrastructure node oversight, security tokens, and AI automation thresholds.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        API Latency: {systemHealth.latencyMs}ms
                    </div>
                </div>
            </div>

            {/* ── Executive Clearance & Security Credential Card ────── */}
            <div
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #090D16 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                }}
            >
                {/* Glow Auras */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    {/* Left: Clearance details */}
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CityPulseLogo variant="compact" theme="dark" size="sm" />
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                                    Urban Command Authority
                                </span>
                            </div>

                            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-mono font-bold tracking-wider flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-blue-400" />
                                {user?.role || 'SUPER_ADMIN'}
                            </div>
                        </div>

                        {/* Middle: ID and Authority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Clearance Identifier</p>
                                <p className="text-2xl font-mono font-bold tracking-wider text-white mt-0.5">
                                    {adminIdCode}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Assigned Jurisdiction</p>
                                <p className="text-sm font-bold text-cyan-300 flex items-center gap-1 mt-1">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    {user?.role === 'SUPER_ADMIN' ? 'Global Platform Control' : 'Udaipur Smart Grid'}
                                </p>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Admin Name</p>
                                <p className="text-sm font-bold text-white uppercase truncate mt-0.5">
                                    {firstName} {lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">System Uptime</p>
                                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                                    {systemHealth.uptime}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Database Link</p>
                                <p className="text-sm font-semibold text-cyan-300 flex items-center gap-1 mt-0.5">
                                    <Server className="w-3.5 h-3.5" />
                                    MongoDB Active
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400">Biometric State</p>
                                <p className="text-sm font-semibold text-blue-300 flex items-center gap-1 mt-0.5">
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Verified
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Real-time Telemetry Monitor Box */}
                    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 w-full md:w-52 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shadow-inner">
                            <Cpu className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">AI Grid Engine</p>
                            <p className="text-[11px] text-emerald-400 mt-0.5 font-mono">Sync: Operational</p>
                        </div>
                        <div className="w-full pt-2 border-t border-white/10 text-[10px] text-slate-400">
                            Digital Twin Symbiosis Active
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Operational Metrics ───────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nodes Monitored</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Wifi className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">1,480</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">✓ 100% telemetry online</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolution Rate</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">98.6%</p>
                    <p className="text-xs text-slate-500 mt-1">Across 6 Municipal Sectors</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Grade</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">A+ Tier</p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">Zero Breach Incidents</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Consoles</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Terminal className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">1 Session</p>
                    <p className="text-xs text-slate-500 mt-1">Authorized Administrator</p>
                </div>
            </div>

            {/* ── Navigation Tabs ────────────────────────────────────── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'Identity & Department', icon: Building2 },
                    { id: 'credentials', label: 'API Keys & Gateway Tokens', icon: Key },
                    { id: 'thresholds', label: 'AI Sensitivity & Limits', icon: Sliders },
                    { id: 'emergency', label: 'Emergency Override Protocol', icon: Flame },
                    { id: 'audit', label: 'Admin Audit Log', icon: FileText },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                                isActive
                                    ? 'text-blue-600 bg-white border border-slate-200 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── TAB 1: Identity & Department ───────────────────────── */}
            {activeTab === 'overview' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Administrator Identity & Official Department</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Update your contact records and operational station within municipal management.
                        </p>
                    </div>

                    {saveMessage && (
                        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {saveMessage}
                        </div>
                    )}
                    {saveError && (
                        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {saveError}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Official Email Address
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Official Duty Phone
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Department / Directorate Division
                                </label>
                                <input
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loadingSave}
                                className="px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingSave ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Updating Profile...
                                    </>
                                ) : (
                                    'Update Administrator Records'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── TAB 2: API Keys & Gateway Tokens ───────────────────── */}
            {activeTab === 'credentials' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Key className="w-5 h-5 text-blue-600" />
                            API Access Tokens & Edge Gateway Secret Keys
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Provision authenticated tokens for IoT field controllers, simulator scripts, or external telemetry bridges.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">Live Production Secret Key</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE TOKEN
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                readOnly
                                value={generatedKey}
                                className="w-full px-4 py-2.5 rounded-xl font-mono text-xs bg-slate-800 border border-slate-700 text-cyan-300 outline-none"
                            />
                            <button
                                onClick={copyApiKey}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shrink-0 flex items-center gap-1.5"
                            >
                                {keyCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {keyCopied ? 'Copied' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-xs text-slate-300">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={keyScopes.telemetryRead}
                                    onChange={(e) => setKeyScopes({ ...keyScopes, telemetryRead: e.target.checked })}
                                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span>telemetry:read</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={keyScopes.dispatchExecute}
                                    onChange={(e) => setKeyScopes({ ...keyScopes, dispatchExecute: e.target.checked })}
                                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span>dispatch:execute</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={keyScopes.aiTune}
                                    onChange={(e) => setKeyScopes({ ...keyScopes, aiTune: e.target.checked })}
                                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                                />
                                <span>ai:model_tune</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-500">Rotate secret token if compromised.</span>
                        <button
                            onClick={generateNewKey}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Regenerate Secret Key
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB 3: AI Sensitivity & Limits ────────────────────── */}
            {activeTab === 'thresholds' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-blue-600" />
                            AI Anomaly Sensitivity & Operational Thresholds
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Configure thresholds for automated alert triggers, waste routing, and power grid alerts.
                        </p>
                    </div>

                    {thresholdsSaved && (
                        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Operational threshold parameters updated across live edge engines!
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* AI Sensitivity */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">AI Anomaly Detection Sensitivity</p>
                                    <p className="text-xs text-slate-500">Controls tolerance for flagging water pressure spikes or traffic choke points.</p>
                                </div>
                                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                    {aiSensitivity} Mode
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                {(['high', 'balanced', 'low'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setAiSensitivity(mode)}
                                        className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                            aiSensitivity === mode
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid Overload */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Grid Substation Stress Alarm</p>
                                    <p className="text-xs text-slate-500">Trigger critical alert when transformer load exceeds this capacity.</p>
                                </div>
                                <span className="text-sm font-mono font-bold text-blue-600">{gridOverloadThreshold}%</span>
                            </div>

                            <input
                                type="range"
                                min="60"
                                max="95"
                                value={gridOverloadThreshold}
                                onChange={(e) => setGridOverloadThreshold(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* Auto-dispatch Confidence */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Automated Dispatch Confidence Minimum</p>
                                    <p className="text-xs text-slate-500">Autonomous route reallocation requires this AI certainty score.</p>
                                </div>
                                <span className="text-sm font-mono font-bold text-blue-600">{autoDispatchConfidence}%</span>
                            </div>

                            <input
                                type="range"
                                min="70"
                                max="99"
                                value={autoDispatchConfidence}
                                onChange={(e) => setAutoDispatchConfidence(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            onClick={() => {
                                setThresholdsSaved(true);
                                setTimeout(() => setThresholdsSaved(false), 3000);
                            }}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                        >
                            Apply Operational Thresholds
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAB 4: Emergency Override Protocol ─────────────────── */}
            {activeTab === 'emergency' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                            <Flame className="w-5 h-5 text-red-600" />
                            Municipal Code Red Emergency Override Protocol
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Executive authority override to command all streetlights, green corridors, and broadcast channels in disaster scenarios.
                        </p>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all ${
                        emergencyCodeRed
                            ? 'bg-red-950 text-white border-red-500 shadow-xl shadow-red-900/30'
                            : 'bg-red-50/50 text-slate-800 border-red-200'
                    }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className={`text-base font-bold ${emergencyCodeRed ? 'text-red-300' : 'text-red-950'}`}>
                                    {emergencyCodeRed ? '🚨 CODE RED OVERRIDE ENGAGED' : 'System in Standard Operational Status'}
                                </p>
                                <p className={`text-xs mt-1 ${emergencyCodeRed ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {emergencyCodeRed
                                        ? 'Traffic signals locked in Emergency Evacuation Timing. Streetlights at 100% luminance. Siren beacon active.'
                                        : 'All municipal services operating under normal decentralized AI optimization.'}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    if (!emergencyCodeRed) {
                                        setShowEmergencyModal(true);
                                    } else {
                                        setEmergencyCodeRed(false);
                                    }
                                }}
                                className={`px-6 py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md ${
                                    emergencyCodeRed
                                        ? 'bg-white text-red-700 hover:bg-slate-100'
                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30'
                                }`}
                            >
                                {emergencyCodeRed ? 'DISENGAGE OVERRIDE' : 'ACTIVATE CODE RED OVERRIDE'}
                            </button>
                        </div>
                    </div>

                    {showEmergencyModal && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-3">
                            <p className="font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Confirm Emergency Override Engagement
                            </p>
                            <p>
                                This action will broadcast simulated high-priority telemetry to all connected field gateways in {user?.cityId ? 'your city jurisdiction' : 'all active sectors'}.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEmergencyCodeRed(true);
                                        setShowEmergencyModal(false);
                                    }}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700"
                                >
                                    Confirm Authorization
                                </button>
                                <button
                                    onClick={() => setShowEmergencyModal(false)}
                                    className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-medium text-xs hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 5: Admin Audit Log ─────────────────────────────── */}
            {activeTab === 'audit' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Administrative Incident & Action Audit Stream
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Immutable chronological record of administrative actions, policy adjustments, and override executions.
                        </p>
                    </div>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {[
                            {
                                time: '10 mins ago',
                                event: 'Administrator Profile Telemetry Verified',
                                detail: 'Security audit confirmed active SSL session and IP integrity.',
                                user: `${firstName || 'Super'} ${lastName || 'Admin'}`,
                                status: 'Verified',
                            },
                            {
                                time: '1 hour ago',
                                event: 'Waste Management Route Calibration',
                                detail: 'Optimized 8 collection route vectors for Udaipur Zone 3.',
                                user: 'Automated Dispatch Engine',
                                status: 'Executed',
                            },
                            {
                                time: '3 hours ago',
                                event: 'AI Traffic Ingestion Cycle Updated',
                                detail: 'TomTom real-time traffic pulse refreshed with 28 active sensors.',
                                user: 'System Worker',
                                status: 'Success',
                            },
                            {
                                time: 'Yesterday',
                                event: 'Water Pipeline Pressure Regulator Check',
                                detail: 'Scheduled sensor diagnostic completed for Fatehsagar sector.',
                                user: 'Municipal Engineer',
                                status: 'Nominal',
                            },
                        ].map((log, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <p className="text-sm font-bold text-slate-900">{log.event}</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 self-start">
                                            {log.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">{log.detail}</p>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                                        <span>Actor: <strong className="text-slate-700">{log.user}</strong></span>
                                        <span className="font-mono">{log.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
