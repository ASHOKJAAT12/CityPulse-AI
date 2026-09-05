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

import { getAllLayers } from '../../components/map/MapConfig';

const DEFAULT_LAYERS: MapLayer[] = getAllLayers().map(l => ({
    key: l.key,
    label: l.label,
    color: l.color || '#333',
    enabled: l.enabled,
    available: l.available
}));

export default function AppHome() {
    const { user, currentCity } = useAuthStore();

    // Map State
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number } | null>(null);
    const [layers, setLayers] = useState<MapLayer[]>(DEFAULT_LAYERS);

    // City Metadata explicitly fetched for public info display (Phase 3 spec)
    const [publicCityInfo, setPublicCityInfo] = useState<any>(null);

    // Sync map center continuously if currentCity switches via header
    useEffect(() => {
        if (currentCity?.latitude && currentCity?.longitude) {
            setMapCenter({ lat: currentCity.latitude, lng: currentCity.longitude });

            // Optionally fetch explicit public metadata endpoint wrapper
            api.get(`/cities/public/${currentCity.id}`).then(res => {
                if (res.data.success) {
                    setPublicCityInfo(res.data.data);
                }
            }).catch(e => console.error("Could not load full city metadata", e));
        }
    }, [currentCity]);

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Ensure coordinates are vaguely valid
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    setMapCenter({ lat, lng });
                }
            },
            (error) => {
                alert('Unable to retrieve your location. Check browser permissions.');
            }
        );
    };

    const toggleLayer = (key: string, enabled: boolean) => {
        setLayers(prev => prev.map(l => l.key === key ? { ...l, enabled } : l));
    };

    if (!currentCity || !mapCenter) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Loading City Operations...</div>;
    }

    return (
        <div className="space-y-6">

            {/* Unified Map Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart City View</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Currently monitoring {currentCity.name}, {currentCity.state}
                        {publicCityInfo?.timezone && ` (${publicCityInfo.timezone})`}
                    </p>
                </div>

                <button
                    onClick={handleGeolocation}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-semibold text-sm"
                >
                    <LocateFixed className="w-4 h-4 text-indigo-600" />
                    Use My Location
                </button>
            </div>

            {/* Map Abstraction */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 bg-white">
                <MapView center={mapCenter} zoom={13} className="h-[500px]">
                    <div className="absolute top-4 right-4 z-[400]">
                        <MapLayerControl layers={layers} onChange={toggleLayer} />
                    </div>
                    <div className="absolute bottom-4 left-4 z-[400]">
                        <MapLegend layers={layers} />
                    </div>

                    {/* Primary City Marker (Fallback if plugins aren't ready) */}
                    <Marker
                        position={{ lat: currentCity.latitude, lng: currentCity.longitude }}
                        label={currentCity.name + " Center"}
                    />
                </MapView>
            </div>

            {/* City Services Dashboard Structure */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">City Services Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <ServiceCard title="Water System" icon={<span className="text-xl">💧</span>} status="NOT_AVAILABLE" message="Integration planned for Phase 4" />
                    <ServiceCard title="Power Grid" icon={<span className="text-xl">⚡</span>} status="NOT_AVAILABLE" message="Integration planned for Phase 5" />
                    <ServiceCard title="Traffic Monitor" icon={<span className="text-xl">🚦</span>} status="NOT_AVAILABLE" message="Integration planned for Phase 5" />
                    <ServiceCard title="EV Stations" icon={<span className="text-xl">🔋</span>} status="NOT_AVAILABLE" message="Integration planned for Phase 6" />
                    <ServiceCard title="Street Lights" icon={<span className="text-xl">💡</span>} status="NOT_AVAILABLE" message="Integration planned for Phase 6" />
                    <ServiceCard title="Waste Management" icon={<span className="text-xl">🚛</span>} status="NOT_AVAILABLE" message="Integration planned for Phase 7" />
                </div>
            </div>

            <div className="text-xs text-center text-slate-400 mt-12 py-4 border-t border-slate-100">
                Data accuracy relies on public API availability. Operational infrastructure updates seamlessly in real-time.
            </div>

        </div>
    );
}
