'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Activity, Zap } from 'lucide-react';
import api from '../../../../services/api';

export default function ElectricitySensorsPage() {
    const [sensors, setSensors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/electricity/sensors/admin')
            .then((res: any) => setSensors(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Smart Telemetry Sensors</h1>
                    <p className="text-slate-500">Configure voltage, current, and power grid sensors.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Grid Sensor
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search sensors..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Sensor Code</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Last Reading</th>
                                <th className="px-6 py-4 font-medium">Limits (Min-Max)</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading sensors...</td></tr>
                            ) : sensors.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No sensors found.</td></tr>
                            ) : (
                                sensors.map((sensor) => (
                                    <tr key={sensor._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <Activity className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            {sensor.sensorCode}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{sensor.sensorType}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {sensor.currentValue !== undefined ? `${sensor.currentValue.toFixed(2)} ${sensor.unit}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {sensor.minThreshold ?? 'N/A'} - {sensor.maxThreshold ?? 'N/A'} {sensor.unit}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${sensor.status === 'ONLINE' ? 'bg-green-100 text-green-700' :
                                                    sensor.status === 'FAULT' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'}`}>
                                                {sensor.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
