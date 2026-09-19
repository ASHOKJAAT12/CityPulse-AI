'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { garbageService } from '@/services/garbage.service';
import trackingSocket from '@/services/trackingSocket';
import { useTrackingStore } from '@/store/useTrackingStore';
import type { LiveVehiclePublic, GarbageRoute, GarbageRouteStop, VehicleLocationUpdatedPayload, VehicleStatusUpdatedPayload } from '@/types/garbage.types';
import type { LatLng } from '@/types';

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map').then(m => m.MapView), { ssr: false, loading: () => <div className="h-full bg-slate-100 flex items-center justify-center animate-pulse">Loading map...</div> });
const LiveVehicleLayerDyn = dynamic(() => import('@/components/map/LiveVehicleLayer').then(m => m.LiveVehicleLayer), { ssr: false });
const Marker = dynamic(() => import('@/components/map').then(mod => mod.Marker), { ssr: false });
const RoutePath = dynamic(() => import('@/components/map').then(mod => mod.Route), { ssr: false });
const Popup = dynamic(() => import('@/components/map').then(mod => mod.Popup), { ssr: false });

export default function CitizenGarbagePage() {
    const [routes, setRoutes] = useState<GarbageRoute[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [routeLiveData, setRouteLiveData] = useState<any>(null);
    const [routeStops, setRouteStops] = useState<GarbageRouteStop[]>([]);
    const [liveVehicles, setLiveVehicles] = useState<LiveVehiclePublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [cityId, setCityId] = useState<string | null>(null);

    const { applyLocationUpdate, applyStatusUpdate, seedVehicle } = useTrackingStore();

    useEffect(() => {
        loadInitialData();

        // Connect as unauthenticated (citizen view)
        trackingSocket.connect();
        trackingSocket.on<VehicleLocationUpdatedPayload>('garbage:vehicle-location-updated', applyLocationUpdate);
        trackingSocket.on<VehicleStatusUpdatedPayload>('garbage:vehicle-status-updated', applyStatusUpdate);

        return () => {
            trackingSocket.off('garbage:vehicle-location-updated');
            trackingSocket.off('garbage:vehicle-status-updated');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedRouteId) {
            loadRouteLive(selectedRouteId);
            loadRouteStops(selectedRouteId);
        }
    }, [selectedRouteId]);

    async function loadInitialData() {
        try {
            setLoading(true);
            // Citizen: routes from city context (cityId from user session)
            const routeRes = await garbageService.getPublicRoutes({ status: 'ACTIVE' });
            const routeList: GarbageRoute[] = routeRes?.data ?? [];
            setRoutes(routeList);

            if (routeList.length > 0) {
                const cId = routeList[0].cityId;
                setCityId(cId);
                trackingSocket.joinCityRoom(cId);

                // Load initial live vehicles
                const liveRes = await garbageService.getLiveVehicles(cId);
                const vehicles: LiveVehiclePublic[] = liveRes?.data ?? [];
                setLiveVehicles(vehicles);

                // Seed tracking store
                vehicles.forEach(v => {
                    seedVehicle(v.id, {
                        vehicleId: v.id,
                        location: v.currentLocation?.coordinates ?? null,
                        trackingStatus: v.trackingStatus,
                        routeId: v.currentRoute?._id ?? null,
                        currentStopId: v.currentStop?._id ?? null,
                    });
                });

                // Select first route
                if (!selectedRouteId) setSelectedRouteId(routeList[0]._id);
            }
        } catch (e) {
            console.error('Failed to load garbage data', e);
        } finally {
            setLoading(false);
        }
    }

    async function loadRouteLive(routeId: string) {
        try {
            const res = await garbageService.getRouteLive(routeId);
            setRouteLiveData(res?.data ?? null);
        } catch (e) {
            console.error('Failed to load route live data', e);
        }
    }

    async function loadRouteStops(routeId: string) {
        try {
            const res = await garbageService.getPublicRouteStops(routeId);
            setRouteStops(res?.data ?? []);
        } catch (e) {
            console.error('Failed to load route stops', e);
            setRouteStops([]);
        }
    }

    const selectedRoute = routes.find(r => r._id === selectedRouteId);
    // Derived Polyline data
    const progress = routeLiveData?.progress;
    const activeVehicle = routeLiveData?.vehicle;
    const sortedStops = [...routeStops].sort((a, b) => a.sequence - b.sequence);
    const routePoints: LatLng[] = sortedStops.map(s => ({ lat: s.location.coordinates[1], lng: s.location.coordinates[0] }));
    const mapCenter = { lat: 24.5854, lng: 73.7125 };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Garbage Collection Tracking</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Track live garbage collection vehicles in your city</p>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
                {/* Sidebar */}
                <div style={{ width: 320, borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: 16 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Active Routes</h2>

                    {loading ? (
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading routes...</div>
                    ) : routes.length === 0 ? (
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>No active routes today.</div>
                    ) : (
                        routes.map(route => (
                            <button
                                key={route._id}
                                onClick={() => setSelectedRouteId(route._id)}
                                style={{
                                    display: 'block', width: '100%', textAlign: 'left',
                                    padding: '12px 14px', borderRadius: 10, marginBottom: 8,
                                    border: selectedRouteId === route._id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                    background: selectedRouteId === route._id ? '#eff6ff' : '#fff',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{route.name}</div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                    {route.schedule?.startTime ?? ''} – {route.schedule?.endTime ?? ''}
                                </div>
                            </button>
                        ))
                    )}

                    {/* Vehicle info card */}
                    {selectedRoute && (
                        <div style={{ marginTop: 20 }}>
                            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                                {selectedRoute.name}
                            </h2>

                            {activeVehicle ? (
                                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>Vehicle</span>
                                        <span style={{
                                            fontSize: 12, fontWeight: 600,
                                            color: activeVehicle.trackingStatus === 'ONLINE' ? '#10b981' : '#f59e0b',
                                        }}>
                                            {activeVehicle.trackingStatus === 'ONLINE' ? '🟢 Live' : '🟡 Delayed'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#374151' }}>🚛 {activeVehicle.vehicleNumber}</div>

                                    {progress && (
                                        <div style={{ marginTop: 12 }}>
                                            {/* Progress bar */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                                <span style={{ color: '#6b7280' }}>Route progress</span>
                                                <span style={{ fontWeight: 600 }}>{progress.progressPercent}%</span>
                                            </div>
                                            <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8, marginBottom: 10 }}>
                                                <div style={{
                                                    background: '#10b981', height: 8, borderRadius: 4,
                                                    width: `${progress.progressPercent}%`,
                                                    transition: 'width 0.5s ease',
                                                }} />
                                            </div>

                                            <div style={{ fontSize: 13, marginBottom: 6 }}>
                                                <span style={{ color: '#6b7280' }}>Stops done: </span>
                                                <strong>{progress.completedStops} / {progress.totalStops}</strong>
                                            </div>

                                            {/* ETA */}
                                            {progress.eta?.available && (
                                                <div style={{
                                                    background: '#eff6ff', border: '1px solid #bfdbfe',
                                                    borderRadius: 8, padding: '10px 12px', marginTop: 8,
                                                }}>
                                                    <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, marginBottom: 2 }}>
                                                        NEXT STOP ETA
                                                    </div>
                                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1d4ed8' }}>
                                                        {progress.eta.label}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 14, color: '#6b7280', fontSize: 13 }}>
                                    No vehicle currently active on this route.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapView
                        center={mapCenter}
                        zoom={13}
                        className="w-full h-full absolute inset-0"
                    >
                        {/* Draw Route Line */}
                        {routePoints.length > 1 && (
                            <RoutePath points={routePoints} color="#4b5563" weight={4} dashed={false} />
                        )}

                        {/* Draw Stops */}
                        {sortedStops.map((stop, i) => (
                            <Marker
                                key={stop._id}
                                position={{ lat: stop.location.coordinates[1], lng: stop.location.coordinates[0] }}
                                label={stop.name}
                                icon={i === 0 ? 'start' : i === sortedStops.length - 1 ? 'end' : 'stop'}
                                popup={
                                    <Popup>
                                        <div className="p-1">
                                            <strong>Sequence: {stop.sequence}</strong><br />
                                            {stop.name}<br />
                                            {stop.scheduledArrival ? `Arrival: ${stop.scheduledArrival}` : ''}
                                        </div>
                                    </Popup>
                                }
                            />
                        ))}

                        <LiveVehicleLayerDyn mode="citizen" />
                    </MapView>
                </div>
            </div>
        </div>
    );
}
