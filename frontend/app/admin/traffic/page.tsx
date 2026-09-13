'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, Settings, AlertTriangle, Route } from 'lucide-react';
import Link from 'next/link';

export default function TrafficAdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">Traffic Intelligence</h1>
                    <p className="text-slate-500 mt-1">Live Congestion and Infrastructure Monitoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Route size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Road Network</p>
                    <h3 className="text-2xl font-bold text-slate-800">Operational</h3>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Active Congestions</p>
                    <h3 className="text-2xl font-bold text-slate-800">Online</h3>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Critical Incidents</p>
                    <h3 className="text-2xl font-bold text-slate-800">Monitoring</h3>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <ShieldCheck size={20} className="text-emerald-400" />
                    </div>
                    <p className="text-sm text-slate-300 font-medium mb-1">System Status</p>
                    <h3 className="text-2xl font-bold text-white mb-4">Online</h3>
                    <Link href="/admin/map">
                        <span className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-lg text-sm font-medium w-full text-center">
                            View Command Map
                        </span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <Users size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">Sensor & Signal Matrix</h4>
                        <p className="text-slate-500 mt-2 text-sm max-w-sm">
                            Manage telemetry data, hardware connectivity, and traffic signals synchronized securely to the cloud.
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-amber-500 p-8 rounded-3xl text-white flex flex-col items-start justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Settings size={120} />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full w-max mb-4">
                            Platform Extension
                        </div>
                        <h4 className="text-2xl font-bold">Traffic Settings</h4>
                        <p className="text-white/80 max-w-sm">
                            Configure thresholds for algorithmic dispatch, sensor anomaly detection, and automated light cycles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
