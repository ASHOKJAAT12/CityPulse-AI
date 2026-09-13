'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../../../../services/api';

export default function ElectricityIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/electricity/incidents')
            .then((res: any) => setIncidents(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleAcknowledge = async (id: string) => {
        if (!confirm('Mark this incident as IN_PROGRESS?')) return;
        try {
            await api.patch(`/admin/electricity/incidents/${id}`, { status: 'IN_PROGRESS' });
            setIncidents(incidents.map(i => i._id === id ? { ...i, status: 'IN_PROGRESS' } : i));
        } catch (error) {
            console.error('Failed to update incident', error);
        }
    };

    const handleResolve = async (id: string) => {
        if (!confirm('Mark this incident as RESOLVED?')) return;
        try {
            await api.patch(`/admin/electricity/incidents/${id}`, { status: 'RESOLVED' });
            setIncidents(incidents.map(i => i._id === id ? { ...i, status: 'RESOLVED' } : i));
        } catch (error) {
            console.error('Failed to resolve incident', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Grid Incidents</h1>
                    <p className="text-slate-500">Respond to sensor spikes, overheating, and critical power faults.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search incidents..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Incident Title</th>
                                <th className="px-6 py-4 font-medium">Type & Severity</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading incidents...</td></tr>
                            ) : incidents.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active incidents. Grid looks stable!</td></tr>
                            ) : (
                                incidents.map((incident) => (
                                    <tr key={incident._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
                                                    ${incident.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                {incident.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 ml-11 line-clamp-1">{incident.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-800 font-medium">{incident.type}</div>
                                            <div className={`text-xs mt-1 ${incident.severity === 'CRITICAL' ? 'text-red-600 font-bold' : 'text-orange-500'}`}>
                                                {incident.severity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(incident.createdAt).toLocaleDateString()} {new Date(incident.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${incident.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                                                    incident.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-green-100 text-green-700'}`}>
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {incident.status === 'OPEN' && (
                                                <button
                                                    onClick={() => handleAcknowledge(incident._id)}
                                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors mb-1 w-full text-left flex items-center gap-2"
                                                >
                                                    <Clock className="w-3 h-3" /> In Progress
                                                </button>
                                            )}
                                            {(incident.status === 'OPEN' || incident.status === 'IN_PROGRESS') && (
                                                <button
                                                    onClick={() => handleResolve(incident._id)}
                                                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors w-full text-left flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Resolve
                                                </button>
                                            )}
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
