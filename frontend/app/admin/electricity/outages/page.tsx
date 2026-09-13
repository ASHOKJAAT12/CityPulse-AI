'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, ZapOff, CheckCircle } from 'lucide-react';
import api from '../../../../services/api';

export default function ElectricityOutagesPage() {
    const [outages, setOutages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/electricity/outages/admin')
            .then((res: any) => setOutages(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleRestore = async (id: string) => {
        if (!confirm('Mark this outage as RESTORED?')) return;
        try {
            await api.patch(`/admin/electricity/outages/${id}`, { status: 'RESTORED' });
            setOutages(outages.map(o => o._id === id ? { ...o, status: 'RESTORED' } : o));
        } catch (error) {
            console.error('Failed to restore outage', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Power Outages</h1>
                    <p className="text-slate-500">Track and manage active power cuts and feeder faults.</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Report Outage
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search outages by area..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Outage Title</th>
                                <th className="px-6 py-4 font-medium">Area</th>
                                <th className="px-6 py-4 font-medium">Severity</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading outages...</td></tr>
                            ) : outages.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No power outages reported.</td></tr>
                            ) : (
                                outages.map((outage) => (
                                    <tr key={outage._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                                    <ZapOff className="w-4 h-4" />
                                                </div>
                                                {outage.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 ml-11 line-clamp-1">{outage.description}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{outage.areaName}</td>
                                        <td className="px-6 py-4 text-slate-600">{outage.severity}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${outage.status === 'ACTIVE' ? 'bg-red-100 text-red-700' :
                                                    outage.status === 'RESTORED' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-700'}`}>
                                                {outage.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {outage.status === 'ACTIVE' && (
                                                <button
                                                    onClick={() => handleRestore(outage._id)}
                                                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors w-full text-left flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Mark Restored
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
