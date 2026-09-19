'use client';
import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, ArrowRight, ShieldCheck, Wrench, Clock } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';

export default function CitizenElectricityPage() {
    const { user } = useAuth();
    const cityId = user?.cityId || 'default';

    const [outages, setOutages] = useState<any[]>([]);
    const [maintenance, setMaintenance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/electricity/outages'),
            api.get('/electricity/maintenance')
        ])
            .then(([outagesRes, mainRes]: any) => {
                setOutages(outagesRes.data.data.filter((o: any) => o.status === 'ACTIVE'));
                setMaintenance(mainRes.data.data.filter((m: any) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both pb-12">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Zap className="w-48 h-48 fill-white/20" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-sm">
                        Public Infrastructure
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">City Power Grid</h1>
                    <p className="text-amber-50 text-lg">
                        Stay informed about your area&apos;s power grid status, active power outages, and scheduled electrical maintenance.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" /> Active Power Outages
                    </h2>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-2xl">Loading grid status...</div>
                    ) : outages.length > 0 ? (
                        <div className="space-y-4">
                            {outages.map(outage => (
                                <div key={outage._id} className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-red-900 text-lg">{outage.title}</h3>
                                        <div className="text-red-700 text-sm mt-1 mb-2 font-medium">Area: {outage.areaName}</div>
                                        <p className="text-red-600/80 text-sm">{outage.description}</p>
                                    </div>
                                    <div className="bg-white/50 text-red-800 px-4 py-2 rounded-xl text-center md:text-right border border-red-200">
                                        <p className="text-xs font-bold uppercase tracking-wide opacity-80 mb-0.5">Outage Start</p>
                                        <p className="font-mono font-bold text-lg">{new Date(outage.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500 flex flex-col items-center">
                            <ShieldCheck className="w-12 h-12 text-emerald-400 mb-3" />
                            <p className="text-lg font-medium text-slate-700">No active power outages reported.</p>
                            <p className="text-sm mt-1">The electrical grid is operating normally.</p>
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pt-4">
                        <Wrench className="w-6 h-6 text-amber-500" /> Upcoming Maintenance
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!loading && maintenance.map(task => (
                            <div key={task._id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded 
                                    ${task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {task.status}
                                </span>
                                <h4 className="font-bold text-slate-800 text-sm mt-3">{task.title}</h4>
                                <p className="text-slate-500 text-xs mt-1">{task.description}</p>
                                <div className="flex items-center gap-2 mt-3 text-slate-600 font-mono text-sm bg-slate-50 p-2 rounded">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    {new Date(task.scheduledStart).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {!loading && maintenance.length === 0 && (
                            <div className="col-span-1 md:col-span-2 text-center text-slate-500 py-6">
                                No upcoming maintenance tasks.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                        <Zap className="w-8 h-8 text-amber-400 mb-4 fill-amber-400" />
                        <h3 className="font-bold text-lg mb-2">Live Telemetry</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            The intelligent monitoring system is actively balancing loads and watching for grid anomalies to prevent outages.
                        </p>
                        <Link href="/city/map">
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-colors border border-white/5 text-sm">
                                View City Map
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
