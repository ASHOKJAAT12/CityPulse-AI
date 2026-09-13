'use client';

import { useState, useEffect } from 'react';
import { Route, Search, Navigation, AlertCircle, HardHat, Car, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CitizenTrafficDashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder for data fetching logic mounting...
        setTimeout(() => setLoading(false), 800);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-red-600 via-red-500 to-amber-500 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
                        <Route size={300} />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-sm">
                            Public Infrastructure
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">City Traffic & Transport</h1>
                        <p className="text-amber-50 text-lg">
                            Live traffic updates, road closures, and maintenance schedules directly from the City Traffic Control Center.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Car className="w-6 h-6 text-red-500" /> Live Highway Status
                        </h2>

                        {loading ? (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-pulse flex flex-col items-center justify-center min-h-[300px]">
                                <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400">Syncing with Traffic Control...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 min-h-[300px] flex flex-col items-center justify-center text-center">
                                <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Traffic Flow is Optimal</h3>
                                <p className="text-slate-500 max-w-md">
                                    Currently, all major arterial roads and highway intersections are evaluating as FREE FLOW status. No major incidents detected on your usual routes.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <HardHat size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-4 flex items-center border-b border-white/10 pb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-400 mr-2" /> Active Advisories
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-red-400 mr-3 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-white mb-1">Elm St Resurfacing</p>
                                            <p className="text-xs text-slate-400">Lane closures expected between 9 PM and 4 AM daily.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-amber-400 mr-3 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-white mb-1">Signal Sync Check</p>
                                            <p className="text-xs text-slate-400">Downtown signals operating in manual flash mode for 30 minutes.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 text-lg mb-4">Plan Your Route</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                View the live interactive map to see real-time congestion heatmaps and intersection status.
                            </p>
                            <Link href="/city/map">
                                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                                    <Navigation className="w-4 h-4 mr-2" /> Open Traffic Map
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
