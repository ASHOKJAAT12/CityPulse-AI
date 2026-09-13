'use client';

import { useAuth } from '../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { Brain, Activity, AlertTriangle, CheckCircle, Search, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';
import api from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface CityHealth {
    healthScore: number;
    activeAlerts: number;
    criticalAlerts: number;
    serviceRisks: Record<string, number>;
}

interface IntelligenceEvent {
    _id: string;
    title: string;
    service: string;
    severity: string;
    riskScore: number;
    confidence: number;
    status: string;
    createdAt: string;
}

export default function IntelligenceDashboard() {
    const { user } = useAuth();
    const { socket } = useWebSocket();
    const [health, setHealth] = useState<CityHealth | null>(null);
    const [events, setEvents] = useState<IntelligenceEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [healthRes, eventsRes] = await Promise.all([
                api.get('/intelligence/city-health'),
                api.get('/intelligence/events')
            ]);
            setHealth(healthRes.data.data);
            setEvents(eventsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch intelligence data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        socket.on('intelligence:event-updated', (ev: any) => {
            fetchData(); // Simplest approach for live reload in dashboard
        });
        return () => {
            socket.off('intelligence:event-updated');
        };
    }, [socket]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Brain className="w-10 h-10 text-indigo-500 animate-pulse" />
                <span className="ml-3 text-slate-500 font-medium">Booting Command Center...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-3 border border-indigo-100 shadow-sm">
                        <Cpu className="w-4 h-4" />
                        AI Command Center active
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Intelligence Engine</h1>
                    <p className="text-slate-500 mt-2">Correlated insights, threat anomalies, and automated recommendations.</p>
                </div>
            </div>

            {/* City Health Aggregate Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20">
                        <Activity className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-indigo-200 font-medium text-sm">City Health Score</h3>
                        <div className="text-5xl font-extrabold tracking-tight mt-2 flex items-baseline gap-2">
                            {health?.healthScore || 100}
                            <span className="text-lg text-indigo-300 font-medium">/ 100</span>
                        </div>
                        <p className="text-sm text-indigo-200 mt-4">Calculated deterministically from active intelligence risk tiers.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium">Active Anomalies</h3>
                            <div className="text-3xl font-bold text-slate-900">{health?.activeAlerts || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <ShieldAlert className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium">Critical Intelligence Events</h3>
                            <div className="text-3xl font-bold text-slate-900">{health?.criticalAlerts || 0}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Correlated Events Feed */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-500" />
                        Active Case Queue
                    </h2>
                </div>

                <div className="divide-y divide-slate-50">
                    {events.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 mb-4 text-emerald-400" />
                            No active intelligence events. The city infrastructure is stable.
                        </div>
                    ) : (
                        events.map((ev) => (
                            <Link key={ev._id} href={`/admin/intelligence/${ev._id}`} className="block hover:bg-slate-50 transition-colors p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ev.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                ev.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                    ev.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                {ev.severity} RISK
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                                {ev.service}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">{new Date(ev.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-slate-800">{ev.riskScore}</div>
                                        <div className="text-xs text-slate-500 font-medium">Risk Score</div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
