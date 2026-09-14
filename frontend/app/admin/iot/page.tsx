'use client';

import { useState, useEffect } from 'react';
import { Cpu, WifiHigh, WifiOff, Globe, ServerCrash, Clock3, Activity } from 'lucide-react';
import Link from 'next/link';

export default function IoTDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/v1/iot/stats', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Placeholder until live data lands
    const displayStats = stats || {
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        gateways: 0,
        rejectedEvents: 0,
        openIncidents: 0
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 tracking-tight flex items-center gap-3">
                        <Cpu className="w-10 h-10 text-cyan-500" />
                        IoT Fleet Command
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Hardware devices, edge gateways, and telemetry endpoints mapped globally.</p>
                </div>
                <div className="flex gap-3 text-sm font-semibold">
                    <Link href="/admin/iot/devices" className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-cyan-400 rounded-xl transition-all">
                        Fleet Inventory
                    </Link>
                    <Link href="/admin/iot/telemetry" className="px-5 py-2.5 bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-200 rounded-xl transition-all">
                        Live Telemetry
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-cyan-500/50 animate-pulse font-mono tracking-widest text-sm">
                    SCANNING FREQUENCIES...
                </div>
            ) : (
                <>
                    {/* Primary Dashboard Map Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 text-emerald-400 mb-3"><WifiHigh className="w-5 h-5" /> Live Sensors</div>
                            <div className="text-5xl font-black text-white">{displayStats.onlineDevices}</div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 text-rose-500 mb-3"><WifiOff className="w-5 h-5" /> Offline</div>
                            <div className="text-5xl font-black text-white">{displayStats.offlineDevices}</div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 text-slate-400 mb-3"><Globe className="w-5 h-5" /> Edge Gateways</div>
                            <div className="text-5xl font-black text-white">{displayStats.gateways}</div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-rose-900/50 bg-gradient-to-br from-rose-950/30 to-slate-900 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 text-rose-400 font-bold mb-3"><ServerCrash className="w-5 h-5" /> Critical Hardware Faults</div>
                            <div className="text-5xl font-black text-white">{displayStats.openIncidents}</div>
                        </div>
                    </div>

                    {/* Secondary Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-indigo-400" /> Ingestion Health</h3>
                                <p className="text-sm text-slate-500">Number of telemetry packets blocked by edge firewall per Phase 19 strict schema rules.</p>
                            </div>
                            <div className="mt-8 text-6xl font-black text-slate-100">{displayStats.rejectedEvents} <span className="text-lg font-medium text-slate-600 block mt-2">Blocked Payloads</span></div>
                        </div>

                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2 mb-2"><Clock3 className="w-5 h-5 text-indigo-400" /> System Time</h3>
                                <p className="text-sm text-slate-500">Fleet wide connection standard.</p>
                            </div>
                            <div className="mt-8 text-5xl font-black text-indigo-400 font-mono">
                                UTC {new Date().toISOString().substring(11, 19)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
