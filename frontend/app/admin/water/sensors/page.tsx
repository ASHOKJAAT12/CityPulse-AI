'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Activity, Droplets, AlertCircle } from 'lucide-react';
import api from '../../../../services/api';

export default function WaterSensorsPage() {
    const [sensors, setSensors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/water/sensors/admin')
            .then((res: any) => setSensors(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">Loading sensors...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sensors & Telemetry</h1>
                    <p className="text-slate-500 mt-1">Configure thresholds and view real-time data for water network sensors.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Sensor
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search sensors by code or type..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>

                {sensors.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No sensors found.</div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {sensors.map((sensor) => (
                            <li key={sensor._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${sensor.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-600' :
                                        sensor.status === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                            sensor.status === 'FAULT' ? 'bg-red-100 text-red-600' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        <Droplets className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{sensor.sensorType.replace('_', ' ')} Sensor</p>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{sensor.sensorCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{sensor.currentValue !== undefined ? sensor.currentValue.toFixed(2) : '--'}
                                            <span className="text-xs text-slate-500 ml-1">{sensor.unit}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">Current Reading</p>
                                    </div>

                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${sensor.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        sensor.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            sensor.status === 'FAULT' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}>
                                        {sensor.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
