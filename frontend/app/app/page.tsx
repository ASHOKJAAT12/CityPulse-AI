'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '../../store/useAuthStore';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { MapLayerControl, MapLayer } from '../../components/map/MapLayerControl';
import { MapLegend } from '../../components/map/MapLegend';
import { LocateFixed } from 'lucide-react';
import api from '../../services/api';

// SSR must be disabled for Leaflet to attach to Window object
const MapView = dynamic(() => import('../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../components/map').then(m => m.Marker), { ssr: false });
const ReportsLayer = dynamic(() => import('../../components/map/ReportsLayer').then(m => m.ReportsLayer), { ssr: false });

import { getAllLayers } from '../../components/map/MapConfig';

const DEFAULT_LAYERS: MapLayer[] = getAllLayers().map(l => ({
    key: l.key,
    label: l.label,
    color: l.color || '#333',
    enabled: l.enabled,
    available: l.available,
}));

export default function AppHome() {
    const { user, currentCity } = useAuthStore();

    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [layers, setLayers] = useState<MapLayer[]>(DEFAULT_LAYERS);
    const [publicCityInfo, setPublicCityInfo] = useState<any>(null);

    useEffect(() => {
        if (currentCity?.latitude && currentCity?.longitude) {
            setMapCenter({ lat: currentCity.latitude, lng: currentCity.longitude });

            api.get(`/cities/public/${currentCity.id}`).then(res => {
                if (res.data.success) setPublicCityInfo(res.data.data);
            }).catch(e => console.error('Could not load full city metadata', e));
        }
    }, [currentCity]);

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    setMapCenter({ lat, lng });
                }
            },
            () => {
                alert('Unable to retrieve your location. Check browser permissions.');
            }
        );
    };

    const toggleLayer = (key: string, enabled: boolean) => {
        setLayers(prev => prev.map(l => l.key === key ? { ...l, enabled } : l));
    };

    if (!currentCity || !mapCenter) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.92)',
                    }}
                >
                    🏙️
                </div>
                <p className="text-sm text-[#A8B0C0] font-medium">Loading City Operations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-7">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1A1D23] tracking-tight">Smart City View</h1>
                    <p className="text-sm text-[#7B8494] mt-1">
                        Monitoring {currentCity.name}, {currentCity.state}
                        {publicCityInfo?.timezone && ` · ${publicCityInfo.timezone}`}
                    </p>
                </div>

                <button
                    onClick={handleGeolocation}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4F6BED] transition-all duration-200 shrink-0"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '5px 5px 12px rgba(163,177,198,0.5), -5px -5px 12px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.8)',
                    }}
                >
                    <LocateFixed className="w-4 h-4" />
                    Use My Location
                </button>
            </div>

            {/* ── Map ── */}
            <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                    boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -8px -8px 20px rgba(255,255,255,0.92)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    background: '#FFFFFF',
                }}
            >
                <MapView center={mapCenter} zoom={13} className="h-[480px]">
                    <div className="absolute top-4 right-4 z-[400]">
                        <MapLayerControl layers={layers} onChange={toggleLayer} />
                    </div>
                    <div className="absolute bottom-4 left-4 z-[400]">
                        <MapLegend layers={layers} />
                    </div>

                    {/* Primary City Marker */}
                    <Marker
                        position={{ lat: currentCity.latitude, lng: currentCity.longitude }}
                        label={currentCity.name + ' Center'}
                    />

                    {/* Citizen Reports Layer */}
                    {layers.find(l => l.key === 'REPORTS')?.enabled && (
                        <ReportsLayer mode="citizen" cityId={user?.cityId ?? undefined} />
                    )}

                </MapView>
            </div>

            {/* ── City Services ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#1A1D23]">City Services Status</h2>
                    <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-green-600"
                        style={{ background: 'rgba(34,197,94,0.1)' }}
                    >
                        All Systems Normal
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <ServiceCard title="Water System" icon={<span className="text-xl">💧</span>} status="NORMAL" message="System Online & Telemetry Active" />
                    <ServiceCard title="Power Grid" icon={<span className="text-xl">⚡</span>} status="NORMAL" message="Grid Stable & Monitored" />
                    <ServiceCard title="Traffic Monitor" icon={<span className="text-xl">🚦</span>} status="NORMAL" message="Traffic Flow Normal" />
                    <ServiceCard title="EV Stations" icon={<span className="text-xl">🔋</span>} status="NORMAL" message="Stations Online" />
                    <ServiceCard title="Street Lights" icon={<span className="text-xl">💡</span>} status="NORMAL" message="Network Synchronized" />
                    <ServiceCard title="Waste Management" icon={<span className="text-xl">🚛</span>} status="NORMAL" message="Live Tracking Active" />
                </div>
            </div>

            {/* Footer note */}
            <div className="text-xs text-center text-[#C8D0DF] pt-2 pb-4 border-t border-[#F0F2F5]">
                Data accuracy relies on public API availability. Operational infrastructure updates in real-time.
            </div>

        </div>
    );
}
