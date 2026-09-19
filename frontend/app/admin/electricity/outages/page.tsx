'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, ZapOff, CheckCircle, X, Send } from 'lucide-react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

export default function ElectricityOutagesPage() {
    const [outages, setOutages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertType, setAlertType] = useState('SCHEDULED');
    const [area, setArea] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [restoration, setRestoration] = useState('');
    const [affectedUsers, setAffectedUsers] = useState('');

    useEffect(() => {
        loadOutages();
    }, []);

    const loadOutages = () => {
        setLoading(true);
        api.get('/electricity/outages/admin')
            .then((res: any) => setOutages(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleRestore = async (id: string) => {
        if (!confirm('Mark this outage as RESTORED?')) return;
        try {
            await api.patch(`/electricity/outages/${id}`, { status: 'RESTORED' });
            setOutages(outages.map(o => o._id === id ? { ...o, status: 'RESTORED' } : o));
            toast.success('Outage restored');
        } catch (error) {
            console.error('Failed to restore outage', error);
            toast.error('Failed to update outage');
        }
    };

    const handleBroadcastAlert = async (e: React.FormEvent) => {
        e.preventDefault();

        let messageBody = '';
        let title = '';

        if (alertType === 'SCHEDULED') {
            title = 'Scheduled Power Outage';
            messageBody = `⚡ ELECTRICITY ALERT\n\nPower outage scheduled\n\nArea: ${area}\nDate: ${date}\nTime: ${time}\nReason: ${reason}\n\nExpected restoration: ${restoration}`;
        } else {
            title = 'Unexpected Power Outage';
            const detectedTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageBody = `🚨 POWER OUTAGE\n\nElectricity has been interrupted in your area.\n\nDetected: ${detectedTime}\nAffected users: ~${affectedUsers || 'Unknown'}\nEstimated restoration: ${restoration}\n\n🔔 Notify me when power returns`;
        }

        try {
            // First broadcast to citizens
            await api.post('/admin/notifications/announcements', {
                title,
                message: messageBody,
                category: 'ELECTRICITY',
                priority: alertType === 'SCHEDULED' ? 'HIGH' : 'CRITICAL',
            });

            toast.success('Alert broadcasted successfully via Plain Text protocol!');

            // Optionally try to record the outage in the db if the endpoint handles it
            try {
                await api.post('/electricity/outages', {
                    title: `[ALERT] ${title} - ${area}`,
                    description: reason || 'Unexpected Interruption',
                    areaName: area,
                    severity: alertType === 'SCHEDULED' ? 'MEDIUM' : 'HIGH',
                    startedAt: new Date().toISOString(),
                    affectedAreas: [area],
                    location: {
                        type: 'Point',
                        coordinates: [73.7125, 24.5854]
                    }
                });
                loadOutages();
            } catch (err: any) {
                console.log('Outage specific creation skipped/failed, alert still sent.');
                alert(`API Error: ${JSON.stringify(err.response?.data || err.message)}`);
            }

            setIsModalOpen(false);
            // Reset form
            setArea(''); setDate(''); setTime(''); setReason(''); setRestoration(''); setAffectedUsers('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to broadcast alert');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Power Outages</h1>
                    <p className="text-slate-500">Track and manage active power cuts and feeder faults.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Report Outage Alert
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

            {/* ── Modal for Alert Creation ── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <ZapOff className="w-5 h-5 text-red-500" />
                                Broadcast Power Outage
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="outageForm" onSubmit={handleBroadcastAlert} className="space-y-5">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Alert Type</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition ${alertType === 'SCHEDULED' ? 'border-red-500 bg-red-50 text-red-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                            <input type="radio" className="hidden" checked={alertType === 'SCHEDULED'} onChange={() => setAlertType('SCHEDULED')} />
                                            Scheduled Maintenance
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition ${alertType === 'UNEXPECTED' ? 'border-red-500 bg-red-50 text-red-700 font-medium' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                            <input type="radio" className="hidden" checked={alertType === 'UNEXPECTED'} onChange={() => setAlertType('UNEXPECTED')} />
                                            Unexpected Outage
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block">Area</label>
                                    <input required type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-400 text-gray-800" placeholder="e.g. Hiran Magri" />
                                </div>

                                {alertType === 'SCHEDULED' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 block">Date</label>
                                                <input required type="text" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" placeholder="03 September" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 block">Time Window</label>
                                                <input required type="text" value={time} onChange={e => setTime(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" placeholder="10:00 AM - 1:00 PM" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block">Reason</label>
                                            <input required type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" placeholder="Maintenance" />
                                        </div>
                                    </>
                                )}

                                {alertType === 'UNEXPECTED' && (
                                    <>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block">Detected Time</label>
                                            <input type="text" value={time} onChange={e => setTime(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" placeholder="Leave empty for current time" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block">Affected Users</label>
                                            <input required type="text" value={affectedUsers} onChange={e => setAffectedUsers(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" placeholder="e.g. 2,400" />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block">Expected Restoration</label>
                                    <input required type="text" value={restoration} onChange={e => setRestoration(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" placeholder="1:00 PM" />
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-medium text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button type="submit" form="outageForm" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/20">
                                <Send className="w-4 h-4" /> Broadcast Alert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
