'use client';

import { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useTrackingStore } from '../../store/useTrackingStore';
import type { TrackingStatus } from '../../types/garbage.types';

/**
 * Status → icon color mapping
 */
const STATUS_ICONS: Record<TrackingStatus, string> = {
    ONLINE: '🟢',
    STALE: '🟡',
    OFFLINE: '🔴',
    NOT_TRACKING: '⚪',
};

/**
 * Create a text-based vehicle marker icon using CSS.
 * Falls back to default Leaflet marker if DivIcon fails.
 */
function createVehicleIcon(trackingStatus: TrackingStatus, heading?: number): Icon | undefined {
    // We return undefined to use default marker as fallback
    // DivIcon is used inline in the JSX to avoid SSR issues
    return undefined;
}

interface Props {
    /** Admin view shows speed/heading details. Citizen view is simplified. */
    mode?: 'admin' | 'citizen';
}

/**
 * LiveVehicleLayer — renders all live vehicle markers from useTrackingStore.
 *
 * Must be used inside a react-leaflet <MapContainer>.
 * Connect WebSocket and populate the store before mounting this component.
 */
export function LiveVehicleLayer({ mode = 'admin' }: Props) {
    const vehicles = useTrackingStore((s) => s.vehicles);
    const vehicleList = Object.values(vehicles).filter(
        (v) => v.location !== null
    );

    if (!vehicleList.length) return null;

    return (
        <>
            {vehicleList.map((vehicle) => {
                if (!vehicle.location) return null;
                const [lng, lat] = vehicle.location;
                const statusIcon = STATUS_ICONS[vehicle.trackingStatus];
                const isStale = vehicle.trackingStatus === 'STALE';

                // Build popup content
                const lastUpdate = vehicle.lastUpdatedAt
                    ? new Date(vehicle.lastUpdatedAt).toLocaleTimeString()
                    : 'Unknown';

                return (
                    <Marker
                        key={vehicle.vehicleId}
                        position={[lat, lng]}
                        opacity={isStale ? 0.6 : 1}
                    >
                        <Popup>
                            <div style={{ minWidth: 180 }}>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                                    {statusIcon} Vehicle
                                </div>
                                <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
                                    Status: <strong>{vehicle.trackingStatus}</strong>
                                </div>

                                {mode === 'admin' && (
                                    <>
                                        {vehicle.speed !== undefined && (
                                            <div style={{ fontSize: 12 }}>Speed: {vehicle.speed?.toFixed(1)} km/h</div>
                                        )}
                                        {vehicle.heading !== undefined && (
                                            <div style={{ fontSize: 12 }}>Heading: {vehicle.heading?.toFixed(0)}°</div>
                                        )}
                                        <div style={{ fontSize: 12 }}>
                                            Progress: {vehicle.progressPercent}% ({vehicle.completedStops} stops done)
                                        </div>
                                    </>
                                )}

                                <div style={{ fontSize: 12, color: '#007bff', marginTop: 4 }}>
                                    {vehicle.etaLabel}
                                </div>

                                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>
                                    Last update: {lastUpdate}
                                    {isStale && <span style={{ color: '#f59e0b' }}> ⚠ Signal lost</span>}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}
