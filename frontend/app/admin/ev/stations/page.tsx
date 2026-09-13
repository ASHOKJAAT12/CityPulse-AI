'use client';

import { useState, useEffect } from 'react';
import { evService } from '../../../../services/ev.service';
import { useAuth } from '../../../../hooks/useAuth';
import { BatteryCharging, Plus, Search, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

export default function EVStationsManager() {
    const { user } = useAuth();
    const cityId = user?.cityId;
    const [stations, setStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!cityId) return;
        evService.getStations(cityId).then(res => {
            setStations(res.data?.data || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [cityId]);

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <BatteryCharging className="w-6 h-6 mr-2 text-emerald-600" /> Station Manager
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage physical hardware locations and power infrastructure.</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-colors shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Station
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-slate-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Station Name</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Identifier</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Available Ports</th>
                                    <th className="px-6 py-4 text-right font-semibold text-slate-700 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No EV charging stations have been mapped in your city yet.
                                        </td>
                                    </tr>
                                ) : (
                                    stations.map((s) => (
                                        <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 flex-shrink-0">
                                                        <Zap className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{s.name}</p>
                                                        <p className="text-xs text-slate-500 flex items-center mt-1">
                                                            <MapPin className="w-3 h-3 mr-1" /> {s.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600">
                                                {s.stationCode}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.status === 'OPERATIONAL' ? 'bg-emerald-100 text-emerald-800' :
                                                    s.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-2 w-16 overflow-hidden">
                                                        <div
                                                            className={`h-full ${s.availableConnectors > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${s.totalConnectors ? Math.min(100, (s.availableConnectors / s.totalConnectors) * 100) : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {s.availableConnectors} / {s.totalConnectors}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors cursor-not-allowed opacity-50">
                                                    Manage Ports
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
