'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Map, Plus, Loader2 } from 'lucide-react';

export default function CitiesPage() {
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', state: '', longitude: '', latitude: '' });

    const fetchCities = async () => {
        try {
            const res = await api.get('/cities');
            setCities(res.data.data);
        } catch (e) {
            console.error('Failed to fetch cities', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/cities', {
                ...form,
                longitude: parseFloat(form.longitude),
                latitude: parseFloat(form.latitude)
            });
            setShowModal(false);
            setForm({ name: '', state: '', longitude: '', latitude: '' });
            fetchCities();
        } catch (e) {
            alert('Creation failed');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Map className="w-6 h-6 mr-3 text-blue-500" /> Cities Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Super Admin global provisioning zone.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add New City
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">City Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Coordinates</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cities.map((city) => (
                                <tr key={city._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{city.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{city.state}</td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-mono opacity-80">
                                        {city.location?.coordinates?.[1].toFixed(4)}, {city.location?.coordinates?.[0].toFixed(4)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${city.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {city.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {cities.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No cities have been provisioned yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 text-lg">Provision New City</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">City Name</label>
                                <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Udaipur" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="e.g. Rajasthan" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                    <input required type="number" step="any" className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="24.5854" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                    <input required type="number" step="any" className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="73.7125" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">Create Provisioning</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
