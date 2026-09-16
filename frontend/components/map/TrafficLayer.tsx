import React, { useEffect, useState } from 'react';
import { Marker, Popup, Route } from './index';
import api from '../../services/api';
import { AlertTriangle, MapPin, Construction, AlertOctagon, Info } from 'lucide-react';

interface TrafficLayerProps {
    cityId: string;
}

export function TrafficLayer({ cityId }: TrafficLayerProps) {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [roads, setRoads] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [incidentsRes, roadsRes] = await Promise.all([
                    api.get(`/traffic/incidents`),
                    api.get(`/traffic/roads`)
                ]);

                if (incidentsRes.data.success) {
                    setIncidents(incidentsRes.data.data);
                }
                if (roadsRes.data.success) {
                    setRoads(roadsRes.data.data);
                }
            } catch (error) {
                console.error("Failed to load Traffic infrastructure", error);
            }
        };

        if (cityId) fetchData();
    }, [cityId]);

    // Helpers to decode incident types to icons/colors
    const getIncidentIcon = (type: string) => {
        switch (type) {
            case 'CONSTRUCTION': return <Construction className="w-5 h-5 text-amber-500" />;
            case 'ACCIDENT': return <AlertOctagon className="w-5 h-5 text-rose-500" />;
            default: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        }
    };

    const getTrafficColor = (status: string) => {
        switch (status) {
            case 'SEVERE':
            case 'HEAVY': return '#ef4444'; // Red
            case 'MODERATE': return '#f59e0b'; // Amber
            case 'FREE_FLOW':
            case 'LIGHT': return '#10b981'; // Emerald
            default: return '#94a3b8'; // Slate
        }
    };

    return (
        <>
            {/* Draw Heavy Traffic / Blocked Roads */}
            {roads.map(road => {
                if (!road.geometry?.coordinates?.length) return null;

                // Convert GeoJSON [Lng, Lat] to Leaflet [Lat, Lng]
                const points = road.geometry.coordinates.map((coord: number[]) => ({
                    lat: coord[1],
                    lng: coord[0]
                }));

                const color = getTrafficColor(road.trafficStatus);

                return (
                    <Route
                        key={road._id}
                        points={points}
                        color={color}
                        weight={road.trafficStatus === 'SEVERE' ? 5 : 4}
                        dashed={road.status === 'PARTIALLY_CLOSED'}
                    />
                );
            })}

            {/* Draw Traffic Incidents / Events */}
            {incidents.map(incident => {
                const lat = incident.location?.coordinates?.[1] || 0;
                const lng = incident.location?.coordinates?.[0] || 0;

                if (!lat || !lng) return null;

                const isResolved = incident.status === 'RESOLVED' || incident.status === 'CLOSED';
                if (isResolved) return null; // Don't clutter the map with old events

                return (
                    <Marker
                        key={incident._id}
                        position={{ lat, lng }}
                        label={incident.title}
                        icon="alert"
                        popup={
                            <div className="min-w-[200px] p-2">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                    {getIncidentIcon(incident.type)}
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight m-0">{incident.title}</h4>
                                        <p className="text-xs text-slate-500 m-0 font-medium">({incident.severity} SEVERITY)</p>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-600 mb-2">
                                    {incident.description}
                                </div>
                                <div className="flex items-center justify-between text-xs mt-3">
                                    <span className="text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Type:</span>
                                    <span className="font-medium text-slate-700">{incident.type}</span>
                                </div>
                            </div>
                        }
                    />
                );
            })}
        </>
    );
}
