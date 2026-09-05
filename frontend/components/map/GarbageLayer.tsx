'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { garbageService } from '../../services/garbage.service';
import { GarbageRoute, GarbageRouteStop } from '../../types/garbage.types';
import type { LatLng } from '../../types';

const Marker = dynamic(() => import('./index').then(mod => mod.Marker), { ssr: false });
const RoutePath = dynamic(() => import('./index').then(mod => mod.Route), { ssr: false });
const Popup = dynamic(() => import('./index').then(mod => mod.Popup), { ssr: false });

export function GarbageLayer() {
    const [routes, setRoutes] = useState<GarbageRoute[]>([]);
    const [stopsByRoute, setStopsByRoute] = useState<Record<string, GarbageRouteStop[]>>({});

    useEffect(() => {
        let mounted = true;
        const fetchGarbageData = async () => {
            try {
                // Fetch ALL routes, but we only show ACTIVE ones on the main map.
                const res = await garbageService.getRoutes();
                const activeRoutes = (res.data as GarbageRoute[] | undefined)?.filter((r: GarbageRoute) => r.status === 'ACTIVE') || [];

                if (mounted) {
                    setRoutes(activeRoutes);
                }

                // Fetch stops for each active route
                const stopsMap: Record<string, GarbageRouteStop[]> = {};
                await Promise.all(activeRoutes.map(async (route) => {
                    const sRes = await garbageService.getStops(route._id);
                    if (sRes.data) stopsMap[route._id] = sRes.data;
                }));

                if (mounted) {
                    setStopsByRoute(stopsMap);
                }
            } catch (e) {
                console.error('Failed to load garbage map layer data:', e);
            }
        };

        fetchGarbageData();
        return () => { mounted = false; };
    }, []);

    if (routes.length === 0) return null;

    return (
        <>
            {routes.map(route => {
                const routePolylinePoints: LatLng[] = route.routeGeometry?.coordinates?.map(coord => ({
                    lat: coord[1],
                    lng: coord[0]
                })) || [];

                const stops = stopsByRoute[route._id] || [];

                return (
                    <div key={route._id}>
                        {routePolylinePoints.length > 1 && (
                            <RoutePath points={routePolylinePoints} color="#10b981" weight={4} dashed={false} />
                        )}

                        {stops.map(stop => (
                            <Marker
                                key={stop._id}
                                position={{ lat: stop.location.coordinates[1], lng: stop.location.coordinates[0] }}
                                label={stop.name}
                                icon="default"
                                popup={
                                    <Popup>
                                        <div className="p-1">
                                            <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">{route.name}</div>
                                            <strong>Stop [{stop.sequence}]:</strong> {stop.name}<br />
                                            {stop.scheduledArrival ? <span className="text-slate-600 text-xs">Arrives: <strong>{stop.scheduledArrival}</strong></span> : null}
                                        </div>
                                    </Popup>
                                }
                            />
                        ))}
                    </div>
                );
            })}
        </>
    );
}
