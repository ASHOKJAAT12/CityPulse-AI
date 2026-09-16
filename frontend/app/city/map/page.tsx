'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import api from '../../../services/api';
import { Compass } from 'lucide-react';
import { MapLayerControl } from '../../../components/map/MapLayerControl';
import { useAuth } from '../../../hooks/useAuth';

const MapView = dynamic(() => import('../../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../../components/map').then(m => m.Marker), { ssr: false });

import { getAvailableLayers } from '../../../components/map/MapConfig';
const WaterLayer = dynamic(() => import('../../../components/map/WaterLayer').then(m => m.WaterLayer), { ssr: false });
const ElectricityLayer = dynamic(() => import('../../../components/map/ElectricityLayer').then(m => m.ElectricityLayer), { ssr: false });
const EVLayer = dynamic(() => import('../../../components/map/EVLayer').then(m => m.EVLayer), { ssr: false });
const TrafficLayer = dynamic(() => import('../../../components/map/TrafficLayer').then(m => m.TrafficLayer), { ssr: false });
const CurrentLocationLayer = dynamic(() => import('../../../components/map/CurrentLocationLayer').then(m => m.CurrentLocationLayer), { ssr: false });

export default function CitizenMapPage() {
    const { user } = useAuth();
    const cityId = user?.cityId || 'default'; // In a real setup based on context/router

    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
        WATER: false,
        ELECTRICITY: false,
        TRAFFIC: true,
        EV: true, // Turn on by default for visibility when they click from the EV dashboard
    });

    const handleLayerToggle = (key: string, enabled: boolean) => {
        setActiveLayers(prev => ({ ...prev, [key]: enabled }));
    };

    const layerConfigs = getAvailableLayers().map(l => ({
        ...l,
        color: l.color || '#94a3b8',
        enabled: activeLayers[l.key] || false
    }));

    return (
        <div className="space-y-6 pt-8 pb-12 max-w-7xl mx-auto px-4 md:px-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Compass className="w-8 h-8 text-cyan-600" />
                    City Infrastructure Map
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                    Public view of operational water and electricity assets across the metropolitan area.
                </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white h-[700px]">
                <div className="absolute top-4 right-4 z-[400]">
                    <MapLayerControl
                        layers={layerConfigs}
                        onChange={handleLayerToggle}
                    />
                </div>

                <MapView center={{ lat: 24.5854, lng: 73.7125 }} zoom={13} className="h-full w-full">
                    {activeLayers.WATER && <WaterLayer cityId={cityId} />}
                    {activeLayers.ELECTRICITY && <ElectricityLayer cityId={cityId} />}
                    {activeLayers.EV && <EVLayer cityId={cityId} />}
                    {activeLayers.TRAFFIC && <TrafficLayer cityId={cityId} />}
                    <CurrentLocationLayer />

                </MapView>
            </div>
        </div>
    );
}
