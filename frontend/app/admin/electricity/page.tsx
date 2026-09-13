'use client';
import { useAuth } from '../../../hooks/useAuth';
import { Zap, List, Settings, AlertTriangle, Calendar, Activity, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function ElectricityAdminDashboard() {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Electricity Management & Monitoring</h1>
                <p className="text-slate-500 mt-2">Manage grid assets, monitor live telemetry, and respond to power outages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/admin/electricity/assets" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-amber-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                                <List className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Grid Assets</h3>
                            <p className="text-slate-500 text-sm mt-2">Manage infrastructure like substations, transformers, and feeders.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/electricity/sensors" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                <Activity className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Smart Telemetry</h3>
                            <p className="text-slate-500 text-sm mt-2">Configure grid sensors, view real-time voltage/currents, and set trip thresholds.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/electricity/incidents" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-orange-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Incidents</h3>
                            <p className="text-slate-500 text-sm mt-2">Respond to threshold violations, power spikes, and grid anomalies.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/electricity/outages" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-red-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                                <Zap className="w-6 h-6 text-red-600 opacity-80" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Power Outages</h3>
                            <p className="text-slate-500 text-sm mt-2">Report active grid failures, track restoration ETAs, and affected areas.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/electricity/maintenance" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-emerald-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                <Wrench className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Maintenance</h3>
                            <p className="text-slate-500 text-sm mt-2">Schedule preventive transformer maintenance and repair activities.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/city/electricity" target="_blank" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-cyan-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                                <Zap className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Citizen View</h3>
                            <p className="text-slate-500 text-sm mt-2">Open the public-facing outage and maintenance dashboard in a new tab.</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white mt-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Zap className="w-48 h-48" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <Zap className="text-amber-400 w-8 h-8 fill-amber-400" />
                    <h2 className="text-2xl font-bold">Live Grid Monitoring Active</h2>
                </div>
                <p className="text-slate-400 mt-2 relative z-10 max-w-2xl">
                    WebSocket telemetry feeds are currently processing sensor data. Grid voltage anomalies and load limits will automatically trigger Incidents.
                </p>
            </div>
        </div>
    );
}
