'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../../services/api';
import { ShieldAlert, Compass } from 'lucide-react';
import { MapLayerControl, MapLayer } from '../../../components/map/MapLayerControl';

const MapView = dynamic(() => import('../../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../../components/map').then(m => m.Marker), { ssr: false });

import { MAP_LAYERS, getAllLayers } from '../../../components/map/MapConfig';
const GarbageLayer = dynamic(() => import('../../../components/map/GarbageLayer').then(m => m.GarbageLayer), { ssr: false });

export default function AdminMapPage() {
    const [mapData, setMapData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publicCityInfo, setPublicCityInfo] = useState<any>(null);

    // Map Layers State
    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
        GARBAGE: false,
    });

    const handleLayerToggle = (key: string, enabled: boolean) => {
        setActiveLayers(prev => ({ ...prev, [key]: enabled }));
    };

    // We do not pollute the citizen auth store.
    // Admins load their own context explicitly.

    useEffect(() => {
        const fetchAdminMap = async () => {
            try {
                const res = await api.get('/admin/map');
                if (res.data.success) {
                    setMapData(res.data.data);

                    // If they have a specific city assigned, fetch its coordinates
                    if (res.data.data.cityId && res.data.data.cityId !== 'global-scope') {
                        const pubRes = await api.get(`/cities/public/${res.data.data.cityId}`);
                        if (pubRes.data.success) {
                            setPublicCityInfo(pubRes.data.data);
                        }
                    }
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Access denied mapping data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdminMap();
    }, []);

    if (isLoading) return <div className="p-8 text-slate-500 animate-pulse font-medium">Securing Map Enclave...</div>;

    if (error) return (
        <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
            <ShieldAlert className="w-16 h-16 text-rose-500 mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">Security Clearance Failed</h2>
            <p className="mt-2 text-slate-500">{error}</p>
        </div>
    );

    // Default Fallback
    const center = publicCityInfo ? { lat: publicCityInfo.latitude, lng: publicCityInfo.longitude } : { lat: 20.5937, lng: 78.9629 }; // Default India

    const layerConfigs = getAllLayers().map(l => ({
        ...l,
        color: l.color || '#94a3b8',
        enabled: activeLayers[l.key] || false
    }));

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Compass className="w-8 h-8 text-rose-600" />
                        Admin Operator Map
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Scope: <span className="font-bold text-rose-600 tracking-wide uppercase px-2 py-0.5 bg-rose-50 rounded select-all">{mapData?.cityId}</span>
                    </p>
                </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-rose-100 bg-white">
                <div className="absolute top-4 left-4 z-[400]">
                    <MapLayerControl
                        layers={layerConfigs}
                        onChange={handleLayerToggle}
                    />
                </div>

                <MapView center={center} zoom={publicCityInfo ? 13 : 5} className="h-[700px]">
                    <div className="absolute top-4 right-4 z-[400] text-xs font-bold uppercase tracking-widest text-white/50 px-2 select-none shadow">CONFIDENTIAL: UNAUTHORIZED SHARING PROHIBITED</div>

                    {publicCityInfo && (
                        <Marker
                            position={{ lat: publicCityInfo.latitude, lng: publicCityInfo.longitude }}
                            label={`${publicCityInfo.name} Primary Root`}
                            icon="city"
                        />
                    )}

                    {activeLayers.GARBAGE && <GarbageLayer />}
                </MapView>
            </div>

        </div>
    );
}
