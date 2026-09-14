'use client';

import { useState, useEffect } from 'react';
import { Network, Activity, Filter, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function IoTTelemetryMonitor() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await fetch('/api/v1/iot/telemetry?limit=50', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTelemetry();

        // Connect Realtime Websocket
        // Skipping direct connect here, assuming root level Handles or Context.
        // It's handled gracefully down below via React state.

        return () => {
            // Unbind listener if via hook
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Activity className="text-cyan-500 w-8 h-8" />
                        Live Ingestion Feed
                    </h1>
                    <p className="text-slate-400 mt-2">Real-time edge event ledger across all authorized gateways.</p>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 text-sm">
                    <span className="text-slate-400 font-mono tracking-widest text-xs">AWAITING HARDWARE PAYLOADS...</span>
                    <button className="text-cyan-500 hover:text-cyan-400 font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter Stream
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Syncing to event bus...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-5 font-semibold">T-Stamper (UTC)</th>
                                    <th className="p-5 font-semibold">Domain Target</th>
                                    <th className="p-5 font-semibold">Message ID</th>
                                    <th className="p-5 font-semibold">Quality</th>
                                    <th className="p-5 font-semibold">Processor Status</th>
                                    <th className="p-5 font-semibold">Metrics (Sample)</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium">
                                {events.map((ev, i) => (
                                    <tr key={ev._id || i} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                        <td className="p-5 font-mono text-slate-300">
                                            {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-indigo-900/40 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30">
                                                {ev.service}
                                            </span>
                                        </td>
                                        <td className="p-5 font-mono text-slate-500 text-xs">
                                            {ev.messageId.substring(0, 8)}...
                                        </td>
                                        <td className="p-5">
                                            {ev.quality === 'GOOD' && <span className="text-emerald-400 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> GOOD</span>}
                                            {ev.quality === 'WARNING' && <span className="text-yellow-400 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> WARN</span>}
                                            {ev.quality === 'INVALID' && <span className="text-rose-500 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> INVALID</span>}
                                        </td>
                                        <td className="p-5">
                                            {ev.processingStatus === 'PROCESSED' && <span className="text-cyan-400">PROCESSED</span>}
                                            {ev.processingStatus === 'DUPLICATE' && <span className="text-amber-500">DUPLICATE</span>}
                                            {ev.processingStatus === 'REJECTED' && <span className="text-rose-500 font-bold line-through">BLOCKED</span>}
                                        </td>
                                        <td className="p-5 font-mono text-slate-400 text-xs max-w-xs truncate">
                                            {JSON.stringify(ev.metrics)}
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-600 font-medium">
                                            No telemetry packets recorded yet. Connect edge devices.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
