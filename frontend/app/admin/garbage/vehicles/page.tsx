'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { garbageService } from '../../../../services/garbage.service';
import { GarbageVehicle, Driver } from '../../../../types/garbage.types';
import { Plus, Edit2, ShieldAlert, Truck } from 'lucide-react';


export default function GarbageVehiclesPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<GarbageVehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, setFormState] = useState<Partial<GarbageVehicle>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [vehRes, driverRes] = await Promise.all([
                garbageService.getVehicles(),
                garbageService.getDrivers()
            ]);
            setVehicles(vehRes.data || []);
            setDrivers(driverRes.data || []);
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            if (formState._id) {
                await garbageService.updateVehicle(formState._id, formState);
            } else {
                await garbageService.createVehicle(formState);
            }
            setIsModalOpen(false);
            setFormState({});
            loadData();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to save vehicle');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Garbage Vehicles</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage operations for garbage collection vehicles.</p>
                </div>
                <button
                    onClick={() => { setFormState({ status: 'AVAILABLE', active: true, vehicleType: 'COMPACTOR' }); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading vehicles...</div>
                ) : vehicles.length === 0 ? (
                    <div className="p-12 pl-6 pr-6 text-center text-slate-400">
                        <Truck className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No vehicles exist yet</h3>
                        <p className="mt-1">Add a new vehicle to build your collection fleet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Number</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${!vehicle.active ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{vehicle.vehicleNumber}</div>
                                            {vehicle.vehicleName && <div className="text-xs text-slate-500">{vehicle.vehicleName}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{vehicle.vehicleType}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {vehicle.driverId ? (vehicle.driverId as Driver).name : <span className="text-slate-400 italic">Unassigned</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border ${vehicle.status === 'AVAILABLE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                vehicle.status === 'ASSIGNED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    vehicle.status === 'MAINTENANCE' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                {vehicle.status}
                                            </span>
                                            {!vehicle.active && <span className="ml-2 text-xs font-semibold text-red-500">INACTIVE</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => { setFormState({ ...vehicle, driverId: (vehicle.driverId as Driver)?._id || '' }); setIsModalOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">{formState._id ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Number *</label>
                                    <input
                                        required
                                        placeholder="e.g. RJ27GC1021"
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase transition-all"
                                        value={formState.vehicleNumber || ''}
                                        onChange={(e) => setFormState({ ...formState, vehicleNumber: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Name (Optional)</label>
                                    <input
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={formState.vehicleName || ''}
                                        onChange={(e) => setFormState({ ...formState, vehicleName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                                        value={formState.vehicleType}
                                        onChange={(e) => setFormState({ ...formState, vehicleType: e.target.value as any })}
                                    >
                                        <option value="COMPACTOR">Compactor</option>
                                        <option value="TIPPER">Tipper</option>
                                        <option value="MINI_TRUCK">Mini Truck</option>
                                        <option value="AUTO">Auto</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (Tons)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={formState.capacity || ''}
                                        onChange={(e) => setFormState({ ...formState, capacity: parseFloat(e.target.value) || undefined })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Driver</label>
                                    <select
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                                        value={formState.driverId as string || ''}
                                        onChange={(e) => {
                                            const driverId = e.target.value;
                                            setFormState({ ...formState, driverId: driverId === '' ? null : driverId });
                                        }}
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {drivers.map(d => (
                                            <option key={d._id} value={d._id}>{d.name} ({d.mobile})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                                        value={formState.status}
                                        onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="ASSIGNED">Assigned</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 border-slate-300 rounded text-blue-600 focus:ring-blue-500"
                                            checked={formState.active}
                                            onChange={(e) => setFormState({ ...formState, active: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-slate-700">Vehicle is Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center">
                                    {saving ? 'Saving...' : 'Save Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
