'use client';

/**
 * Map Abstraction Layer — SmartCity 360
 *
 * All map code is isolated here. The rest of the application
 * uses these components and never imports Leaflet/Mapbox directly.
 *
 * Current provider: Leaflet via react-leaflet
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, Polyline, Polygon as LeafletPolygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/utils/cn';
import type { LatLng } from '@/types';

// Fix Leaflet's default icon path issues with Next.js
import L from 'leaflet';

const DefaultIcon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// ── Types ──────────────────────────────────────────────────────

export interface MapViewProps {
    center?: LatLng;
    zoom?: number;
    className?: string;
    children?: React.ReactNode;
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

// ── Map Helpers ───────────────────────────────────────────────

function MapUpdater({ center, zoom }: { center: LatLng; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([center.lat, center.lng], zoom);
    }, [center, zoom, map]);
    return null;
}

// ── MapView ───────────────────────────────────────────────────

export function MapView({
    center = { lat: 24.5854, lng: 73.7125 }, // Default: Udaipur
    zoom = 12,
    className,
    children,
}: MapViewProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <MapPlaceholder className={className} />;
    }

    return (
        <div className={cn('map-container relative min-h-[400px]', className)}>
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full absolute inset-0 z-0"
            >
                <MapUpdater center={center} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {children}
            </MapContainer>
        </div>
    );
}

// ── Marker ────────────────────────────────────────────────────

export function Marker({ position, label, popup, onClick }: MarkerProps) {
    return (
        <LeafletMarker
            position={[position.lat, position.lng]}
            title={label}
            eventHandlers={{ click: onClick }}
        >
            {popup && <LeafletPopup>{popup}</LeafletPopup>}
        </LeafletMarker>
    );
}

// ── Route ─────────────────────────────────────────────────────

export function Route({ points, color = 'blue', weight = 3, dashed = false }: RouteProps) {
    const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
    return (
        <Polyline
            positions={latLngs}
            pathOptions={{ color, weight, dashArray: dashed ? '5, 10' : undefined }}
        />
    );
}

// ── Polygon ───────────────────────────────────────────────────

export function Polygon({ points, color = 'blue', fillColor = 'blue', fillOpacity = 0.2 }: PolygonProps) {
    const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
    return (
        <LeafletPolygon
            positions={latLngs}
            pathOptions={{ color, fillColor, fillOpacity }}
        />
    );
}

// ── Popup ────────────────────────────────────────────────────

export function Popup({ children, className }: PopupProps) {
    return (
        <div className={cn('text-sm', className)}>
            {children}
        </div>
    );
}

// ── MapPlaceholder ────────────────────────────────────────────

export function MapPlaceholder({ className, label = 'Map' }: { className?: string; label?: string }) {
    return (
        <div
            className={cn(
                'map-container min-h-[400px] bg-slate-100 flex flex-col items-center justify-center gap-3',
                className
            )}
        >
            <span className="text-4xl">🗺️</span>
            <div className="text-center">
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">Loading map provider...</p>
            </div>
        </div>
    );
}
