'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../hooks/useAuth';
import { garbageService } from '../../../../../services/garbage.service';
import { GarbageRoute, GarbageRouteStop, GarbageVehicle, Driver } from '../../../../../types/garbage.types';
import { ArrowLeft, Save, MapPin, Play, Square, Settings, Menu, Trash2, Clock, Map as MapIcon, Route as RouteIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { LatLng } from '../../../../../types';


// Dynamically import MapView to prevent SSR issues with leaflet
const MapView = dynamic(() => import('../../../../../components/map').then(mod => mod.MapView), { ssr: false, loading: () => <div className="h-full bg-slate-100 flex items-center justify-center animate-pulse">Loading map environment...</div> });
const Marker = dynamic(() => import('../../../../../components/map').then(mod => mod.Marker), { ssr: false });
const RoutePath = dynamic(() => import('../../../../../components/map').then(mod => mod.Route), { ssr: false });
const Popup = dynamic(() => import('../../../../../components/map').then(mod => mod.Popup), { ssr: false });

export default function GarbageRouteEditor() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [route, setRoute] = useState<GarbageRoute | null>(null);
    const [stops, setStops] = useState<GarbageRouteStop[]>([]);

    // Auxiliary data
    const [vehicles, setVehicles] = useState<GarbageVehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Map Interaction State
    const [mapCenter, setMapCenter] = useState<LatLng | undefined>(undefined);
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedMapPoint, setSelectedMapPoint] = useState<LatLng | null>(null);
    const [newStopForm, setNewStopForm] = useState<Partial<GarbageRouteStop>>({});

    const routeId = typeof id === 'string' ? id : '';

    const loadData = async () => {
        try {
            setLoading(true);
            const [routeRes, stopsRes, vehRes, driRes] = await Promise.all([
                garbageService.getRouteById(routeId),
                garbageService.getStops(routeId),
                garbageService.getVehicles(),
                garbageService.getDrivers(),
            ]);
            setRoute(routeRes.data);
            setStops(stopsRes.data || []);
            setVehicles(vehRes.data || []);
            setDrivers(driRes.data || []);

            // Re-center map explicitly if needed.
            if (user?.city?.latitude && user?.city?.longitude) {
                setMapCenter({ lat: user.city.latitude, lng: user.city.longitude });
            }
        } catch (e: any) {
            console.error(e);
            setError('Failed to load route data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (routeId) loadData();
    }, [routeId, user]);

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleUpdateMeta = async (fields: Partial<GarbageRoute>) => {
        if (!route) return;
        try {
            const res = await garbageService.updateRoute(route._id, fields);
            setRoute(res.data);
            showSuccess('Route updated.');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Error updating route');
        }
    };

    const handleActivate = async () => {
        try {
            setSaving(true);
            await garbageService.activateRoute(routeId);
            showSuccess('Route activated');
            loadData();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Activation failed validations');
            setTimeout(() => setError(null), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            setSaving(true);
            await garbageService.deactivateRoute(routeId);
            showSuccess('Route deactivated');
            loadData();
        } catch (e: any) {
            setError('Failed to deactivate route');
        } finally {
            setSaving(false);
        }
    };

    const handleAddStopAtMap = async (e: any) => {
        if (!isAddMode) return;
        const latlng: LatLng = e.latlng;
        // Proceed to show mini-form right where they clicked, or in a sidebar.
        // We will just open a mini dialog in the sidebar.
        setSelectedMapPoint(latlng);
        setNewStopForm({
            name: `Stop ${stops.length + 1}`,
            sequence: stops.length + 1,
            routeId
        });
        setIsAddMode(false); // turn off add mode once clicked
    };

    const submitNewStop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMapPoint || !newStopForm.name || !newStopForm.sequence) return;
        try {
            setSaving(true);
            await garbageService.addStop(routeId, {
                name: newStopForm.name,
                sequence: newStopForm.sequence,
                latitude: selectedMapPoint.lat,
                longitude: selectedMapPoint.lng,
                scheduledArrival: newStopForm.scheduledArrival,
                notes: newStopForm.notes
            });
            showSuccess('Stop added');
            setSelectedMapPoint(null);
            setNewStopForm({});
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add stop');
        } finally {
            setSaving(false);
        }
    };

    const deleteStop = async (stopId: string) => {
        if (!confirm('Remove this stop?')) return;
        try {
            await garbageService.removeStop(routeId, stopId);
            showSuccess('Stop removed');
            loadData();
        } catch (err: any) {
            setError('Failed to remove stop');
        }
    };

    // Quick Time Editing directly
    const updateStopTime = async (stopId: string, time: string) => {
        try {
            await garbageService.updateStop(routeId, stopId, { scheduledArrival: time });
            showSuccess('Time updated');
            // Optimistic update
            setStops(prev => prev.map(s => s._id === stopId ? { ...s, scheduledArrival: time } : s));
        } catch (e: any) {
            setError(e.response?.data?.message || 'Error updating time');
        }
    };

    const updateStopOrder = async (stopId: string, newSeqString: string) => {
        const seq = parseInt(newSeqString);
        if (isNaN(seq) || seq <= 0) return;
        try {
            await garbageService.updateStop(routeId, stopId, { sequence: seq });
            loadData();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Sequence conflict. Make sure sequences are unique.');
            loadData(); // Revert
        }
    };

    if (loading && !route) {
        return <div className="p-12 text-center">Loading editor...</div>;
    }

    if (!route) {
        return <div className="p-12 text-center text-red-500">Route not found</div>;
    }

    // Compute map route points if GeoJSON exists. 
    // MongoDB stores GeoJSON as [lng, lat], react-leaflet expects lat, lng
    const routePolylinePoints: LatLng[] = route.routeGeometry?.coordinates?.map(coord => ({
        lat: coord[1],
        lng: coord[0]
    })) || [];

    const isActive = route.status === 'ACTIVE';

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] -mt-4 fade-in">
            {/* Header Toolbar */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10 sticky top-0 shrink-0 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => router.push('/admin/garbage/routes')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-slate-900 border-b border-transparent focus-within:border-emerald-500 transition-colors">
                                <input
                                    className="bg-transparent focus:outline-none min-w-[300px]"
                                    defaultValue={route.name}
                                    onBlur={(e) => { if (e.target.value !== route.name && e.target.value.trim().length > 0) handleUpdateMeta({ name: e.target.value }) }}
                                />
                            </h1>
                            <span className={`ml-3 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                route.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {route.status}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">Route Editor View</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {successMessage && <span className="text-sm font-medium text-emerald-600 mr-2 zoom-in">{successMessage}</span>}
                    {error && <span className="text-sm font-medium text-red-500 max-w-[250px] truncate mr-2" title={error}>{error}</span>}

                    {isActive ? (
                        <button disabled={saving} onClick={handleDeactivate} className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg transition-colors text-sm">
                            <Square className="w-4 h-4 mr-2" /> Deactivate
                        </button>
                    ) : (
                        <button disabled={saving} onClick={handleActivate} className="flex items-center px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-medium rounded-lg transition-colors text-sm shadow-sm">
                            <Play className="w-4 h-4 mr-2" /> Activate Route
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-slate-50 rounded-b-3xl">
                {/* Left Sidebar Layout (Stops & Configuration) */}
                <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    <div className="p-6 border-b border-slate-100 flex-shrink-0">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center"><Settings className="w-4 h-4 mr-2" /> Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Vehicle</label>
                                <select
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    value={(route.vehicleId as GarbageVehicle)?._id || ''}
                                    onChange={(e) => handleUpdateMeta({ vehicleId: e.target.value === '' ? null : e.target.value as any })}
                                    disabled={isActive}
                                >
                                    <option value="">Unassigned</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.status})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Driver</label>
                                <select
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    value={(route.driverId as Driver)?._id || ''}
                                    onChange={(e) => handleUpdateMeta({ driverId: e.target.value === '' ? null : e.target.value as any })}
                                    disabled={isActive}
                                >
                                    <option value="">Unassigned</option>
                                    {drivers.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        defaultValue={route.schedule?.startTime || ''}
                                        onBlur={(e) => handleUpdateMeta({ schedule: { ...route.schedule, startTime: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        defaultValue={route.schedule?.endTime || ''}
                                        onBlur={(e) => handleUpdateMeta({ schedule: { ...route.schedule, endTime: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="text-[11px] text-amber-600 leading-tight bg-amber-50 rounded-lg p-2 border border-amber-100">
                                Info: Certain modifications require route deactivation first to preserve data integrity.
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                <RouteIcon className="w-4 h-4 mr-2 text-emerald-600" /> Waypoints ({stops.length})
                            </h3>
                            <button
                                onClick={() => {
                                    setIsAddMode(!isAddMode);
                                    if (selectedMapPoint) setSelectedMapPoint(null);
                                }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center ${isAddMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
                            >
                                {isAddMode ? 'Cancel Edit' : '+ Add via Map'}
                            </button>
                        </div>

                        {isAddMode && !selectedMapPoint && (
                            <div className="m-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-xs font-medium rounded-r-lg">
                                Instruction: Click anywhere on the map to place a collection stop waypoint.
                            </div>
                        )}

                        {selectedMapPoint && (
                            <form onSubmit={submitNewStop} className="m-4 p-5 bg-white border-2 border-emerald-500 rounded-xl shadow-lg">
                                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-emerald-500" /> Confirm Stop Details
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Stop Sequence #</label>
                                        <input type="number" required className="w-full text-sm border p-2 rounded" value={newStopForm.sequence || ''} onChange={e => setNewStopForm({ ...newStopForm, sequence: parseInt(e.target.value) || undefined })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Stop Name</label>
                                        <input type="text" required className="w-full text-sm border p-2 rounded" value={newStopForm.name || ''} onChange={e => setNewStopForm({ ...newStopForm, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Scheduled Time (Optional)</label>
                                        <input type="time" className="w-full text-sm border p-2 rounded" value={newStopForm.scheduledArrival || ''} onChange={e => setNewStopForm({ ...newStopForm, scheduledArrival: e.target.value })} />
                                    </div>
                                </div>
                                <div className="mt-4 flex space-x-2">
                                    <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm">Save</button>
                                    <button type="button" onClick={() => setSelectedMapPoint(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="p-4 space-y-3">
                            {stops.map(stop => (
                                <div key={stop._id} className="bg-white border text-sm border-slate-200 rounded-lg p-3 hover:border-emerald-300 transition-colors shadow-sm relative group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start">
                                            <div className="w-6 h-6 shrink-0 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs mr-3 border border-emerald-200">
                                                {stop.sequence}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{stop.name}</h4>
                                                <div className="flex items-center text-xs text-slate-500 mt-1">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    <input
                                                        type="time"
                                                        className="bg-transparent focus:bg-slate-50 p-0.5 border border-transparent focus:border-slate-300 rounded cursor-pointer"
                                                        defaultValue={stop.scheduledArrival || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== stop.scheduledArrival) {
                                                                updateStopTime(stop._id, e.target.value);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-1 blur-[1px] hover:blur-none transition-all">
                                                    {stop.location.coordinates[0].toFixed(5)},{stop.location.coordinates[1].toFixed(5)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button title="Delete Stop" onClick={() => deleteStop(stop._id)} className="p-1 text-slate-300 hover:text-red-500 rounded bg-slate-50 hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Small hidden editor to quickly change sequence order */}
                                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center text-xs justify-between">
                                        <span className="text-slate-500">Order:</span>
                                        <input
                                            type="number"
                                            className="w-16 border rounded px-1 py-0.5 text-center text-slate-700 font-medium"
                                            defaultValue={stop.sequence}
                                            onBlur={e => {
                                                if (parseInt(e.target.value) !== stop.sequence) {
                                                    updateStopOrder(stop._id, e.target.value);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {stops.length === 0 && !isAddMode && (
                                <p className="text-slate-400 text-center py-8 text-sm">No stops recorded for this route.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Interactive Map Area */}
                <div className="flex-1 relative cursor-crosshair">
                    {mapCenter ? (
                        <div
                            className="w-full h-full"
                        // This is a bit of a hack to capture Leaflet map clicks easily via wrapping div.
                        // Properly we should hook into react-leaflet useMapEvents inside a child component.
                        // We will implement an invisible overlay to intercept clicks if we are in add mode,
                        // or we can just rely on built-in map events if wrapped nicely.
                        >
                            <MapView
                                center={mapCenter}
                                zoom={13}
                                className="w-full h-full rounded-br-3xl"
                            >
                                {/* Capture Clicks helper */}
                                <DynamicMapEvents onClick={handleAddStopAtMap} />

                                {/* Draw Route Line */}
                                {routePolylinePoints.length > 1 && (
                                    <RoutePath points={routePolylinePoints} color="#10b981" weight={4} dashed={!isActive} />
                                )}

                                {/* Draw Stops */}
                                {stops.map(stop => (
                                    <Marker
                                        key={stop._id}
                                        position={{ lat: stop.location.coordinates[1], lng: stop.location.coordinates[0] }}
                                        label={stop.name}
                                        icon="default"
                                        popup={
                                            <Popup>
                                                <div className="p-1">
                                                    <strong>Sequence: {stop.sequence}</strong><br />
                                                    {stop.name}<br />
                                                    {stop.scheduledArrival ? `Time: ${stop.scheduledArrival}` : ''}
                                                </div>
                                            </Popup>
                                        }
                                    />
                                ))}

                                {/* Preview pin when selecting a point on the map */}
                                {selectedMapPoint && (
                                    <Marker position={selectedMapPoint} label="New Stop" popup={<Popup>New Stop Placed Here</Popup>} />
                                )}
                            </MapView>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Determining map location...</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component to capture useMapEvents
function DynamicMapEvents({ onClick }: { onClick: any }) {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
        click(e: any) {
            onClick(e);
        }
    });
    return null;
}
