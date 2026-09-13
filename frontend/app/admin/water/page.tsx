'use client';
import { useAuth } from '../../../hooks/useAuth';
import { Droplet, List, Settings, AlertTriangle, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';

export default function WaterAdminDashboard() {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Water Management & Monitoring</h1>
                <p className="text-slate-500 mt-2">Manage water assets, monitor live sensors, and respond to incidents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/admin/water/assets" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <List className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Water Assets</h3>
                            <p className="text-slate-500 text-sm mt-2">Manage infrastructure like tanks, reservoirs, and pumps.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/water/sensors" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                <Activity className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Sensors & Analytics</h3>
                            <p className="text-slate-500 text-sm mt-2">Configure sensors, viewing real-time readouts, and thresholds.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/water/incidents" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-red-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Incidents</h3>
                            <p className="text-slate-500 text-sm mt-2">Respond to threshold violations, warnings, and asset failures.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/water/schedules" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-emerald-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                <Calendar className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Supply Schedules</h3>
                            <p className="text-slate-500 text-sm mt-2">Configure public water provisioning times per zone.</p>
                        </div>
                    </div>
                </Link>

                <Link href="/city/water" target="_blank" className="group block">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-cyan-200 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                                <Droplet className="w-6 h-6 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Citizen View</h3>
                            <p className="text-slate-500 text-sm mt-2">Open the public-facing dashboard in a new tab.</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white mt-8 shadow-lg">
                <div className="flex items-center gap-3">
                    <Droplet className="text-blue-400 w-8 h-8" />
                    <h2 className="text-2xl font-bold">Live Monitoring Active</h2>
                </div>
                <p className="text-slate-400 mt-2">
                    WebSocket feeds are currently active. Threshold violations will automatically be escalated to Incidents.
                </p>
            </div>
        </div>
    );
}
