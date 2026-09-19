'use client';

import React from 'react';
import { MapView, Marker } from './index';

export default function LiveMapWrapper() {
    return (
        <MapView
            center={{ lat: 24.5854, lng: 73.7125 }}
            zoom={13}
            className="w-full h-full rounded-2xl z-0"
        >
            {/* Sample Markers representing live issues */}
            <Marker position={{ lat: 24.5854, lng: 73.7125 }} color="#EF4444" label="Emergency Issue" />
            <Marker position={{ lat: 24.6000, lng: 73.7000 }} color="#F59E0B" label="Power Outage" />
            <Marker position={{ lat: 24.5700, lng: 73.7300 }} color="#0CA5E9" label="Water Alert" />
        </MapView>
    );
}
