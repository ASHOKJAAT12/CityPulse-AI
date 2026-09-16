import React, { useEffect, useState } from 'react';
import { Marker, Popup } from './index';
import { LocateFixed } from 'lucide-react';
import { useMap } from 'react-leaflet';

export function CurrentLocationLayer() {
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const map = useMap();

    useEffect(() => {
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition({ lat, lng });

                    // Fly to location on first detection if desired, or at least have it rendered
                    // For a cleaner UX in dashboard, let's just quietly plot it without yanking the camera automatically.
                },
                (err) => console.log('Geolocation error:', err),
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    if (!position) return null;

    return (
        <Marker
            position={position}
            label="Your Current Location"
            popup={
                <div className="flex items-center gap-2 font-medium text-slate-800 p-1">
                    <LocateFixed className="w-5 h-5 text-indigo-600" />
                    You are here
                </div>
            }
        />
    );
}
