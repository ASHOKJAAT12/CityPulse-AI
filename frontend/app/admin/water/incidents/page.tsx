'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Search, CheckCircle2 } from 'lucide-react';
import api from '../../../../services/api';

export default function WaterIncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/water/incidents') // Since this is an admin route it uses adminAuth middleware
            .then((res: any) => setIncidents(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const markAcknowledged = async (id: string, currentStatus: string) => {
        if (currentStatus !== 'OPEN') return;
        try {
            await api.patch(`/admin/water/incidents/${id}`, { status: 'ACKNOWLEDGED' });
            setIncidents(prev => prev.map(i => i._id === id ? { ...i, status: 'ACKNOWLEDGED' } : i));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">Loading water incidents...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Active Incidents</h1>
                <p className="text-slate-500 mt-1">Review threshold violations, sensor faults, and infrastructure alerts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                    <h3 className="text-red-700 font-medium text-sm">Critical Events</h3>
                    <p className="text-3xl font-bold text-red-900 mt-2">{incidents.filter(i => i.severity === 'CRITICAL' && (i.status === 'OPEN' || i.status === 'ACKNOWLEDGED')).length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <h3 className="text-amber-700 font-medium text-sm">Warnings / High</h3>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{incidents.filter(i => i.severity === 'HIGH' && (i.status === 'OPEN' || i.status === 'ACKNOWLEDGED')).length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="text-blue-700 font-medium text-sm">Total Open</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter incidents by title or status..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>

                {incidents.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center text-slate-500">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                        <p>No active incidents found.</p>
                        <p className="text-sm">The water network is currently operating nominally.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {incidents.map((incident) => (
                            <li key={incident._id} className="p-5 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className={`mt-1 flex-shrink-0 ${incident.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900">{incident.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${incident.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                                                    incident.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {incident.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{incident.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(incident.createdAt).toLocaleTimeString()}
                                                </span>
                                                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-bold border border-slate-200 px-2 py-0.5 rounded">
                                                    {incident.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-auto">
                                        {incident.status === 'OPEN' && (
                                            <button
                                                onClick={() => markAcknowledged(incident._id, incident.status)}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                        {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
                                            <button className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
