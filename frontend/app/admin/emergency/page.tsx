'use client';
import { useAuth } from '../../../hooks/useAuth';
import { ShieldAlert, Map as MapIcon, Users, Siren, CheckCircle, Activity, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function EmergencyCommandCenter() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ active: 0, critical: 0, overdue: 0, respondingTeams: 0 });

    useEffect(() => {
        if (!user) return;
        // In a real build, we fetch /api/v1/emergency?status=REPORTED,VERIFIED... etc.
        // For the scaffolding, we'll implement later or fetch now if the backend is running.
        const fetchStats = async () => {
            try {
                // Mock stats or quick fetch
                setStats({ active: 12, critical: 3, overdue: 1, respondingTeams: 8 });
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [user]);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Emergency Command Center</h1>
                    <p className="text-slate-500 mt-2">Real-time Orchestration & Incident Response</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                        Live Feeds Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-500 text-sm font-medium">Active Emergencies</h3>
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                            <Siren className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-4">{stats.active}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-500 text-sm font-medium">Critical (P1)</h3>
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mt-4">{stats.critical}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-500 text-sm font-medium">Overdue SLA</h3>
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mt-4">{stats.overdue}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-500 text-sm font-medium">Teams Responding</h3>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-4">{stats.respondingTeams}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Operations Queue Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border text-slate-900 rounded-2xl p-6 shadow-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Operations Queue</h2>
                            <Link href="/admin/emergency/create" className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                                Trigger Emergency
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {/* Placeholder Data -> Real data loaded from API next */}
                            <div className="p-4 border rounded-xl flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div>
                                    <div className="flex gap-2 items-center mb-1">
                                        <span className="font-bold text-red-600">P1</span>
                                        <span className="text-slate-500 text-sm">EMG-2026-000001</span>
                                    </div>
                                    <p className="font-medium">Massive Power Outage Downtown</p>
                                    <p className="text-sm text-slate-500">Source: AI Anomaly (Confidence: 98%)</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        UNVERIFIED
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Actions Area */}
                <div className="space-y-6">
                    <Link href="/city/emergency" target="_blank" className="group block">
                        <div className="bg-slate-900 text-white rounded-2xl p-6 hover:bg-slate-800 transition-colors h-full flex flex-col justify-between shadow-md">
                            <div>
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                    <MapIcon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Live Operations Map</h3>
                                <p className="text-slate-400 text-sm mt-2">View full geospatial orchestrations of all incidents.</p>
                            </div>
                        </div>
                    </Link>

                    <div className="bg-white rounded-2xl p-6 border shadow-sm h-64 overflow-y-auto">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-slate-400" />
                            Real-time Feed
                        </h3>
                        {/* WebSocket Events go here */}
                        <div className="space-y-3">
                            <div className="text-sm pb-2 border-b">
                                <span className="text-xs text-slate-400 block">14:02</span>
                                <span className="text-slate-700">New Citizen Report potentially indicating main leak.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
