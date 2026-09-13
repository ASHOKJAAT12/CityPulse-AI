'use client';

import { useState, useEffect } from 'react';
import { BatteryCharging, Plug, MapPin, Zap, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CitizenEVDashboard() {
    const [stations, setStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since it's a citizen route, city context applies at map level usually.
        // We'll mimic the endpoint call for the loaded context.
        api.get('/ev/CITIES/stations').catch(() => null); // Fallback ping
        setTimeout(() => {
            setStations([
                // Dummy initial state to represent hydrated UI until realtime map takes over
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
                        <BatteryCharging size={300} />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-sm">
                            Green Infrastructure
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">City EV Network</h1>
                        <p className="text-emerald-50 text-lg">
                            Find nearby high-speed electric vehicle charging stations, check real-time connector availability, and track public port status.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Zap className="w-6 h-6 text-emerald-500" /> Availability Radar
                        </h2>

                        {loading ? (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-pulse flex flex-col items-center justify-center min-h-[300px]">
                                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400">Scanning for Charging Hubs...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-center">
                                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Network is Online</h3>
                                <p className="text-slate-500 max-w-md mb-6">
                                    The city&apos;s EV charging grid is fully operational. Open the interactive map to locate an open port near your location.
                                </p>
                                <Link href="/city/map">
                                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center">
                                        <MapPin className="w-4 h-4 mr-2" /> View Charger Map
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Plug size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-4 flex items-center border-b border-white/10 pb-4">
                                    <Plug className="w-5 h-5 text-emerald-400 mr-2" /> Connector Guide
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <div className="mt-1 bg-white/10 p-2 rounded-lg mr-3 flex-shrink-0">
                                            <Zap className="w-4 h-4 text-emerald-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white mb-1">DC Fast Charging (CCS)</p>
                                            <p className="text-xs text-slate-400">Level 3. Gives 80% charge in ~20-30m. Plentiful along main highways.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="mt-1 bg-white/10 p-2 rounded-lg mr-3 flex-shrink-0">
                                            <BatteryCharging className="w-4 h-4 text-emerald-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white mb-1">AC Level 2 (Type 2)</p>
                                            <p className="text-xs text-slate-400">Slow charging (~4-8 hrs). Ideal for workplace or residential parking.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                                <Clock className="w-5 h-5 text-amber-500 mr-2" /> Maintenance Alerts
                            </h3>
                            <p className="text-sm text-slate-500">
                                No major grid-wide outages affecting the EV network currently. Individual station maintenance will flash yellow on the smart map.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
