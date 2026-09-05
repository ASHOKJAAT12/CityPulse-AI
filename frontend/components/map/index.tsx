'use client';

/**
 * Map Abstraction Layer — SmartCity 360
 *
 * All map code is isolated here. The rest of the application
 * uses these components and never imports Leaflet/Mapbox directly.
 *
 * This allows the map provider to be swapped (e.g., Leaflet → Mapbox)
 * without touching feature components.
 *
 * Current provider: Leaflet (open-source, no API key required)
 * Future: Support Mapbox / Google Maps via NEXT_PUBLIC_MAP_PROVIDER
 *
 * Phase 7+ will implement garbage vehicle live tracking using these components.
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import type { LatLng } from '@/types';

// ── Types ──────────────────────────────────────────────────────

export interface MapViewProps {
    center?: LatLng;
    zoom?: number;
    className?: string;
    children?: React.ReactNode;
    onMapReady?: (map: unknown) => void;
}

export interface MarkerProps {
    position: LatLng;
    label?: string;
    icon?: 'default' | 'garbage' | 'ev' | 'alert' | 'city';
    popup?: React.ReactNode;
    onClick?: () => void;
}

export interface RouteProps {
    points: LatLng[];
    color?: string;
    weight?: number;
    dashed?: boolean;
}

export interface PolygonProps {
    points: LatLng[];
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
}

export interface PopupProps {
    children: React.ReactNode;
    className?: string;
}

// ── MapView ───────────────────────────────────────────────────

/**
 * Primary map container. Renders a Leaflet map on the client.
 *
 * Note: Leaflet requires DOM — this component is client-only.
 * Use dynamic import with ssr: false in page components:
 *
 *   const MapView = dynamic(() => import('@/components/map').then(m => m.MapView), { ssr: false });
 */
export function MapView({
    center = { lat: 24.5854, lng: 73.7125 }, // Default: Udaipur, Rajasthan
    zoom = 12,
    className,
    children,
    onMapReady,
}: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<unknown>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        let isMounted = true;

        async function initMap() {
            try {
                // Dynamic import avoids SSR issues with Leaflet
                const L = (await import('leaflet')).default;
                await import('leaflet/dist/leaflet.css');

                if (!isMounted || !mapRef.current) return;

                // Fix default icon paths (Leaflet/webpack issue)
                // @ts-expect-error — Leaflet internal
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(mapRef.current, {
                    center: [center.lat, center.lng],
                    zoom,
                    zoomControl: true,
                    scrollWheelZoom: true,
                });

                // OpenStreetMap tiles (no API key needed)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                mapInstanceRef.current = map;
                onMapReady?.(map);
            } catch (error) {
                console.error('Failed to initialize map:', error);
            }
        }

        void initMap();

        return () => {
            isMounted = false;
            if (mapInstanceRef.current) {
                const L = mapInstanceRef.current as { remove: () => void };
                L.remove();
                mapInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={cn('map-container min-h-[400px] relative', className)}>
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: 400 }} />
            {/* Children can be overlaid controls — actual Leaflet layers go through imperative API */}
            {children}
        </div>
    );
}

// ── Marker ────────────────────────────────────────────────────

/**
 * Map marker — renders via the MapView's Leaflet instance.
 * Phase 7+: Will render live garbage vehicle positions.
 *
 * Note: In Phase 7, this will be implemented to work with
 * a shared map context to add/remove markers imperatively.
 */
export function Marker({ position, label }: MarkerProps) {
    // Phase 7+: Use MapContext to access Leaflet instance and add marker
    // For now, returns null — overlay markers on MapView via onMapReady callback
    return (
        <div
            title={label ?? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
            className="hidden" // Placeholder — Phase 7 implementation
            data-lat={position.lat}
            data-lng={position.lng}
        />
    );
}

// ── Route ─────────────────────────────────────────────────────

/**
 * Route polyline on the map.
 * Phase 5+: Will render garbage collection routes.
 */
export function Route({ points }: RouteProps) {
    return (
        <div
            className="hidden"
            data-route-points={JSON.stringify(points)} // Phase 5+ implementation
        />
    );
}

// ── Polygon ───────────────────────────────────────────────────

/**
 * Service area polygon.
 * Phase 3+: Will render city service zones.
 */
export function Polygon({ points }: PolygonProps) {
    return (
        <div
            className="hidden"
            data-polygon-points={JSON.stringify(points)} // Phase 3+ implementation
        />
    );
}

// ── Popup ────────────────────────────────────────────────────

/**
 * Information popup for markers and features.
 */
export function Popup({ children, className }: PopupProps) {
    return (
        <div className={cn('card p-3 text-sm max-w-xs', className)}>
            {children}
        </div>
    );
}

// ── MapPlaceholder ────────────────────────────────────────────

/**
 * Renders when the map is not yet available (SSR fallback or Phase 0).
 */
export function MapPlaceholder({ className, label = 'Map' }: { className?: string; label?: string }) {
    return (
        <div
            className={cn(
                'map-container min-h-[400px] bg-surface-900 flex flex-col items-center justify-center gap-3',
                className
            )}
        >
            <span className="text-4xl">🗺️</span>
            <div className="text-center">
                <p className="text-sm font-medium text-surface-200">{label}</p>
                <p className="text-xs text-surface-500">Map loads on the client</p>
            </div>
        </div>
    );
}
