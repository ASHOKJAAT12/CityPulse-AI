'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { garbageService } from '../../../../services/garbage.service';
import { GarbageRoute, GarbageVehicle, Driver } from '../../../../types/garbage.types';
import { Plus, Edit2, Map as MapIcon, Route as RouteIcon, PlayCircle, StopCircle, Navigation } from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GarbageRoutesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [routes, setRoutes] = useState<GarbageRoute[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formState, setFormState] = useState<Partial<GarbageRoute>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await garbageService.getRoutes();
            setRoutes(res.data || []);
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            const data = await garbageService.createRoute({
                name: formState.name,
                description: formState.description,
            });
            setIsModalOpen(false);
            if (data.data && data.data._id) {
                router.push(`/admin/garbage/routes/${data.data._id}`);
            } else {
                loadData();
            }
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to create route');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Garbage Routes</h1>
                    <p className="text-slate-500 text-sm mt-1">Design and manage scheduled collection routes.</p>
                </div>
                <button
                    onClick={() => { setFormState({}); setIsModalOpen(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Create Route
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading routes...</div>
                ) : routes.length === 0 ? (
                    <div className="p-12 pl-6 pr-6 text-center text-slate-400">
                        <RouteIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No routes exist yet</h3>
                        <p className="mt-1">Create your first operational collection route.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {routes.map((route) => (
                            <div key={route._id} className={`border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all bg-white relative flex flex-col ${route.status === 'INACTIVE' ? 'opacity-70' : ''}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-slate-900">{route.name}</h3>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${route.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        route.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-slate-100 text-slate-700 border-slate-200'
                                        }`}>
                                        {route.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">{route.description || 'No description provided'}</p>

                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="text-sm text-slate-700 flex justify-between">
                                        <span className="text-slate-500">Vehicle:</span>
                                        <span className="font-medium truncate ml-2">{(route.vehicleId as GarbageVehicle)?.vehicleNumber || 'Unassigned'}</span>
                                    </div>
                                    <div className="text-sm text-slate-700 flex justify-between">
                                        <span className="text-slate-500">Driver:</span>
                                        <span className="font-medium truncate ml-2">{(route.driverId as Driver)?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="text-sm text-slate-700 flex justify-between">
                                        <span className="text-slate-500">Schedule:</span>
                                        <span className="font-medium truncate ml-2">{route.schedule?.startTime ? `${route.schedule.startTime} - ${route.schedule.endTime}` : 'Unset'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <Link
                                        href={`/admin/garbage/routes/${route._id}`}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                                    >
                                        <MapIcon className="w-4 h-4 mr-2" />
                                        Open Editor
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">Create New Route</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleCreateDraft} className="p-6">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Route Name *</label>
                                    <input
                                        required
                                        placeholder="e.g. Ward 7 Morning Run"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        value={formState.name || ''}
                                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        value={formState.description || ''}
                                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                    />
                                </div>
                                <div className="text-sm text-slate-500 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    A route starts as a DRAFT. You can assign vehicles, drivers, set schedules, and draw the route on the map editor in the next step.
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center">
                                    {saving ? 'Creating...' : 'Create & Edit on Map'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
