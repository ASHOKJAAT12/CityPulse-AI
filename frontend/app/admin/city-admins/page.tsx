'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Users, Plus, Loader2 } from 'lucide-react';

export default function CityAdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', cityId: ''
    });

    const fetchData = async () => {
        try {
            const [adminsRes, citiesRes] = await Promise.all([
                api.get('/city-admins'),
                api.get('/cities')
            ]);
            setAdmins(adminsRes.data.data);
            setCities(citiesRes.data.data);
        } catch (e) {
            console.error('Failed to fetch data', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/city-admins', {
                ...form,
                role: 'CITY_ADMIN'
            });
            setShowModal(false);
            setForm({ firstName: '', lastName: '', email: '', password: '', cityId: '' });
            fetchData();
        } catch (e) {
            alert('Creation failed');
        }
    };

    const getCityName = (id: string) => cities.find(c => c._id === id)?.name || 'Unknown';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Users className="w-6 h-6 mr-3 text-purple-500" /> Administrative Personnel
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage localized City Admins strictly bounded to their zones.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/20 transition-all flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" /> Assign Personnel
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Identity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned City Zone</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{admin.firstName} {admin.lastName}</td>
                                    <td className="px-6 py-4 text-slate-500">{admin.email}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        <span className="inline-flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                            {getCityName(admin.cityId)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${admin.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No city admins are assigned yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Creation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 text-lg">Assign City Admin</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Jane" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input required type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@city.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
                                <input required type="password" minLength={8} className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Operational City</label>
                                <select required className="w-full border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-purple-500 bg-white" value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })}>
                                    <option value="" disabled>Select a city zone</option>
                                    {cities.filter(c => c.status === 'ACTIVE').map(city => (
                                        <option key={city._id} value={city._id}>{city.name} ({city.state})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors">Deploy Personnel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
