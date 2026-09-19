'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Activity, ShieldCheck, Database, Server, ShieldAlert, TriangleAlert, Zap, Droplets, Car, Lightbulb, Map as MapIcon, Cpu, Waves } from 'lucide-react';
import dynamic from 'next/dynamic';

const LiveMapWrapper = dynamic(() => import('@/components/map/LiveMapWrapper'), { ssr: false });

const statCards = [
    {
        icon: ShieldCheck,
        iconBg: 'rgba(34,197,94,0.1)',
        iconColor: '#16a34a',
        label: 'Clearance Level',
        getValue: (user: any) => user.role,
    },
    {
        icon: Activity,
        iconBg: 'rgba(79,107,237,0.1)',
        iconColor: '#4F6BED',
        label: 'System Status',
        getValue: () => 'Online',
        dot: true,
    },
    {
        icon: Database,
        iconBg: 'rgba(147,51,234,0.1)',
        iconColor: '#7c3aed',
        label: 'Database Node',
        getValue: () => 'Connected',
    },
    {
        icon: Server,
        iconBg: 'rgba(245,158,11,0.1)',
        iconColor: '#d97706',
        label: 'Active Zone',
        getValue: (user: any) => user.cityId ? 'City Limited' : 'Global',
    },
];

const commandCenterStats = [
    { icon: TriangleAlert, label: 'Active Issues', value: '127', color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
    { icon: activityIcon, label: 'Critical', value: '8', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    { icon: Zap, label: 'Power Outages', value: '4', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { icon: Droplets, label: 'Water Alerts', value: '3', color: '#0CA5E9', bg: 'rgba(12,165,233,0.1)' },
    { icon: Car, label: 'Traffic Events', value: '7', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { icon: Lightbulb, label: 'Streetlight', value: '21', color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
];

const aiPredictions = [
    { id: 1, text: 'Flood risk - Ward 7', icon: Waves, color: '#0CA5E9' },
    { id: 2, text: 'Transformer failure risk - Ward 12', icon: Zap, color: '#F59E0B' },
    { id: 3, text: 'Traffic congestion - Lake Road', icon: Car, color: '#EF4444' },
];

function activityIcon(props: any) {
    return <TriangleAlert {...props} />;
}


export default function AdminDashboard() {
    const { user } = useAuth();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!user) return null;

    return (
        <div className="space-y-8 pb-10">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#1A1D23] tracking-tight">
                    Welcome back, {user.firstName}
                </h1>
                <p className="text-sm text-[#7B8494] mt-1">
                    Current operational status for your deployment zone.
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map(({ icon: Icon, iconBg, iconColor, label, getValue, dot }) => (
                    <div
                        key={label}
                        className="rounded-2xl p-6 transition-all duration-200"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                            style={{
                                background: iconBg,
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.3), inset -2px -2px 5px rgba(255,255,255,0.85)',
                            }}
                        >
                            <Icon style={{ width: '1.25rem', height: '1.25rem', color: iconColor }} />
                        </div>

                        <p className="text-xs font-medium text-[#A8B0C0] mb-1 uppercase tracking-wide">{label}</p>
                        <div className="flex items-center gap-2">
                            {dot && (
                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            )}
                            <p className="text-xl font-bold text-[#1A1D23]">{getValue(user)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* ── Left Column: Command Center & AI Predictions ── */}
                <div className="xl:col-span-1 space-y-8">

                    {/* CITY COMMAND CENTER */}
                    <div
                        className="rounded-3xl p-6 relative overflow-hidden"
                        style={{
                            background: '#1A1D23', // Dark theme matching the mockup vibe
                            boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -8px -8px 20px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(26,29,35,0.1)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-700/50 pb-4">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-bold text-white tracking-widest uppercase">CITY COMMAND CENTER</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {commandCenterStats.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</span>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                                <Icon className="w-4 h-4 mb-1" style={{ color: stat.color }} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* AI PREDICTIONS */}
                    <div
                        className="rounded-3xl p-6 relative overflow-hidden"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -8px -8px 20px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <Cpu className="w-5 h-5 text-[#4F6BED]" />
                            <h2 className="text-sm font-bold text-[#1A1D23] tracking-widest uppercase">AI PREDICTIONS</h2>
                        </div>
                        <div className="space-y-3">
                            {aiPredictions.map(pred => (
                                <div key={pred.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="shrink-0 p-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)' }}>
                                        <pred.icon className="w-4 h-4" style={{ color: pred.color }} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{pred.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right Column: Live City Map ── */}
                <div className="xl:col-span-2">
                    <div
                        className="rounded-3xl p-2 relative h-full min-h-[450px]"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -8px -8px 20px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white flex items-center gap-2">
                            <MapIcon className="w-4 h-4 text-[#4F6BED]" />
                            <span className="text-sm font-bold text-[#1A1D23] tracking-wider uppercase">Live City Map</span>
                        </div>

                        {/* Legend inspired by mockup */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white flex items-center gap-6">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] shadow-sm animate-pulse" />
                            <Zap className="w-4 h-4 text-[#F59E0B]" />
                            <Droplets className="w-4 h-4 text-[#0CA5E9]" />
                            <Car className="w-4 h-4 text-[#8B5CF6]" />
                            <Lightbulb className="w-4 h-4 text-[#EAB308]" />
                        </div>

                        {isClient ? (
                            <LiveMapWrapper />
                        ) : (
                            <div className="w-full h-full min-h-[450px] bg-slate-50 flex items-center justify-center rounded-2xl"><span className="text-slate-400 font-medium">Loading Map...</span></div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Security Policy Banner ── */}
            <div
                className="rounded-3xl p-8 md:p-10 relative overflow-hidden mt-8"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -8px -8px 20px rgba(255,255,255,0.92)',
                    border: '1px solid rgba(255,255,255,0.8)',
                }}
            >
                <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none hidden md:block">
                    <ShieldAlert style={{ width: '16rem', height: '16rem', color: '#1A1D23' }} />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Zero Trust Architecture Enabled
                    </div>

                    <h2 className="text-xl font-bold text-[#1A1D23] mb-3">Security Policy Active</h2>
                    <p className="text-sm text-[#7B8494] leading-relaxed">
                        You are authenticated as{' '}
                        <span className="font-semibold text-[#1A1D23]">{user.role}</span>.
                        Your session is strictly protected by JWT rotations and bound to authorized capabilities.{' '}
                        {user.role === 'CITY_ADMIN'
                            ? 'You are mapped safely within your local City Zone.'
                            : 'As a Super Admin, you retain platform-wide write access.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
