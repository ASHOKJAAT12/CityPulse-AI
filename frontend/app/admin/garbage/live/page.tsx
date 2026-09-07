'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { garbageService } from '@/services/garbage.service';
import trackingSocket from '@/services/trackingSocket';
import { useTrackingStore, type LiveVehicleState } from '@/store/useTrackingStore';
import type { GarbageVehicle, TrackingStatus, VehicleLocationUpdatedPayload, VehicleStatusUpdatedPayload } from '@/types/garbage.types';
import { getAccessToken } from '@/services/api';

const STATUS_CONFIG: Record<TrackingStatus, { label: string; color: string; dot: string }> = {
    ONLINE: { label: 'Online', color: '#10b981', dot: '🟢' },
    STALE: { label: 'Stale', color: '#f59e0b', dot: '🟡' },
    OFFLINE: { label: 'Offline', color: '#ef4444', dot: '🔴' },
    NOT_TRACKING: { label: 'Not Tracking', color: '#6b7280', dot: '⚪' },
};

export default function LiveTrackingPage() {
    const [vehicles, setVehicles] = useState<GarbageVehicle[]>([]);
    const [routes, setRoutes] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [startRouteMap, setStartRouteMap] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [startModal, setStartModal] = useState<{ vehicleId: string; vehicleNum: string } | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [routeOptions, setRouteOptions] = useState<any[]>([]);

    const { applyLocationUpdate, applyStatusUpdate, seedVehicle } = useTrackingStore();
    const vehicleStates = useTrackingStore((s) => s.vehicles);

    useEffect(() => {
        loadData();
        // Connect WebSocket for live updates
        const token = getAccessToken() ?? undefined;
        const socket = trackingSocket.connect(token);

        trackingSocket.on<VehicleLocationUpdatedPayload>('garbage:vehicle-location-updated', applyLocationUpdate);
        trackingSocket.on<VehicleStatusUpdatedPayload>('garbage:vehicle-status-updated', applyStatusUpdate);

        return () => {
            trackingSocket.off('garbage:vehicle-location-updated');
            trackingSocket.off('garbage:vehicle-status-updated');
        };
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [vehicleRes, routeRes] = await Promise.all([
                garbageService.getVehicles(),
                garbageService.getRoutes(),
            ]);
            const vehicleList: GarbageVehicle[] = vehicleRes?.data ?? [];
            setVehicles(vehicleList);

            // Seed tracking store with current state
            vehicleList.forEach(v => {
                seedVehicle(v._id, {
                    vehicleId: v._id,
                    routeId: v.currentRouteId ?? null,
                    location: v.currentLocation?.coordinates ?? null,
                    trackingStatus: v.trackingStatus ?? 'NOT_TRACKING',
                    currentStopId: v.currentStopId ?? null,
                });
            });

            const routeList: any[] = routeRes?.data ?? [];
            setRouteOptions(routeList.filter((r: any) => r.status === 'ACTIVE'));
            const routeMap = Object.fromEntries(routeList.map((r: any) => [r._id, r]));
            setRoutes(routeMap);

            // Join city room for live updates
            const cityId = vehicleList[0]?.cityId;
            if (cityId) trackingSocket.joinCityRoom(cityId);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    }

    async function handleStart(vehicleId: string) {
        if (!selectedRouteId) return;
        setActionLoading(prev => ({ ...prev, [vehicleId]: true }));
        try {
            await garbageService.startTracking(vehicleId, selectedRouteId);
            setStartModal(null);
            setSelectedRouteId('');
            await loadData();
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Failed to start tracking');
        } finally {
            setActionLoading(prev => ({ ...prev, [vehicleId]: false }));
        }
    }

    async function handleStop(vehicleId: string) {
        if (!confirm('Stop tracking this vehicle?')) return;
        setActionLoading(prev => ({ ...prev, [vehicleId]: true }));
        try {
            await garbageService.stopTracking(vehicleId);
            await loadData();
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Failed to stop tracking');
        } finally {
            setActionLoading(prev => ({ ...prev, [vehicleId]: false }));
        }
    }

    const liveCount = Object.values(vehicleStates).filter((v: LiveVehicleState) => v.trackingStatus === 'ONLINE').length;
    const staleCount = Object.values(vehicleStates).filter((v: LiveVehicleState) => v.trackingStatus === 'STALE').length;

    return (
        <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Live Vehicle Tracking</h1>
                    <p style={{ color: '#6b7280', marginTop: 4 }}>Real-time GPS monitoring for garbage fleet</p>
                </div>
                <Link href="/admin/map" style={{
                    background: '#3b82f6', color: '#fff', padding: '10px 18px', borderRadius: 8,
                    textDecoration: 'none', fontSize: 14, fontWeight: 600,
                }}>
                    🗺 Open Live Map
                </Link>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Online', value: liveCount, color: '#10b981', bg: '#d1fae5' },
                    { label: 'Stale', value: staleCount, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Total Fleet', value: vehicles.length, color: '#3b82f6', bg: '#dbeafe' },
                ].map(card => (
                    <div key={card.label} style={{
                        background: card.bg, borderRadius: 12, padding: '16px 24px',
                        flex: 1, textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    {error}
                </div>
            )}

            {/* Vehicle table */}
            {loading ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>Loading vehicles...</div>
            ) : (
                <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {['Vehicle', 'Type', 'Status', 'Route', 'Progress', 'ETA', 'Last Update', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(vehicle => {
                                const live = vehicleStates[vehicle._id];
                                const trackingStatus = live?.trackingStatus ?? vehicle.trackingStatus ?? 'NOT_TRACKING';
                                const cfg = STATUS_CONFIG[trackingStatus];
                                const isTracking = trackingStatus === 'ONLINE' || trackingStatus === 'STALE';
                                const lastUpdate = live?.lastUpdatedAt ? new Date(live.lastUpdatedAt).toLocaleTimeString() : '—';
                                const routeId = live?.routeId ?? vehicle.currentRouteId;
                                const route = routeId ? routes[routeId] : null;
                                const busy = actionLoading[vehicle._id];

                                return (
                                    <tr key={vehicle._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                                            {vehicle.vehicleNumber}
                                            {vehicle.vehicleName && <div style={{ fontSize: 11, color: '#9ca3af' }}>{vehicle.vehicleName}</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{vehicle.vehicleType}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                background: cfg.color + '20', color: cfg.color,
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                                            }}>
                                                {cfg.dot} {cfg.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                            {route ? <span style={{ color: '#3b82f6' }}>{route.name}</span> : <span style={{ color: '#9ca3af' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                            {live?.progressPercent !== undefined
                                                ? <div>
                                                    <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, width: 80 }}>
                                                        <div style={{ background: '#10b981', height: 6, borderRadius: 4, width: `${live.progressPercent}%` }} />
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{live.progressPercent}%</div>
                                                </div>
                                                : <span style={{ color: '#9ca3af' }}>—</span>
                                            }
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                                            {live?.etaLabel ? <span style={{ color: '#3b82f6' }}>{live.etaLabel}</span> : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af' }}>{lastUpdate}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {isTracking ? (
                                                <button
                                                    onClick={() => handleStop(vehicle._id)}
                                                    disabled={busy}
                                                    style={{
                                                        background: '#ef4444', color: '#fff', border: 'none',
                                                        padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                                                        fontSize: 12, fontWeight: 600, opacity: busy ? 0.6 : 1,
                                                    }}
                                                >
                                                    {busy ? '...' : '⏹ Stop'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setStartModal({ vehicleId: vehicle._id, vehicleNum: vehicle.vehicleNumber })}
                                                    disabled={busy || !vehicle.active}
                                                    style={{
                                                        background: '#10b981', color: '#fff', border: 'none',
                                                        padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                                                        fontSize: 12, fontWeight: 600,
                                                        opacity: (busy || !vehicle.active) ? 0.5 : 1,
                                                    }}
                                                >
                                                    ▶ Start
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Start Tracking Modal */}
            {startModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Start Tracking</h2>
                        <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>
                            Vehicle: <strong>{startModal.vehicleNum}</strong>
                        </p>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                            Select Active Route *
                        </label>
                        <select
                            value={selectedRouteId}
                            onChange={e => setSelectedRouteId(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db',
                                fontSize: 14, marginBottom: 20,
                            }}
                        >
                            <option value="">Choose a route...</option>
                            {routeOptions.map((r: any) => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => { setStartModal(null); setSelectedRouteId(''); }}
                                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: 14 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStart(startModal.vehicleId)}
                                disabled={!selectedRouteId || actionLoading[startModal.vehicleId]}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                                    background: '#10b981', color: '#fff', cursor: 'pointer',
                                    fontSize: 14, fontWeight: 600,
                                    opacity: !selectedRouteId ? 0.5 : 1,
                                }}
                            >
                                {actionLoading[startModal.vehicleId] ? 'Starting...' : '▶ Start Tracking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
