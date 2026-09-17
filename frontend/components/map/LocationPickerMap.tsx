'use client';
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon in Next.js
const PinIcon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface LocationPickerMapProps {
    value: { lat: number; lng: number } | null;
    onChange: (loc: { lat: number; lng: number }) => void;
    defaultCenter?: { lat: number; lng: number };
}

/** Moves map center when `center` prop changes (e.g. after auto-locate) */
function MapPanner({ center }: { center: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], map.getZoom() < 14 ? 15 : map.getZoom());
        }
    }, [center, map]);
    return null;
}

/** Listens to map clicks and fires onChange */
function ClickHandler({ onChange }: { onChange: (loc: { lat: number; lng: number }) => void }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export function LocationPickerMap({ value, onChange, defaultCenter = { lat: 24.5854, lng: 73.7125 } }: LocationPickerMapProps) {
    return (
        <MapContainer
            center={[defaultCenter.lat, defaultCenter.lng]}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ cursor: 'crosshair' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onChange={onChange} />
            <MapPanner center={value} />
            {value && (
                <Marker position={[value.lat, value.lng]} icon={PinIcon} />
            )}
        </MapContainer>
    );
}
