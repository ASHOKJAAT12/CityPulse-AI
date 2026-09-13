import React, { useEffect, useState } from 'react';
import { CircleMarker, Popup, useMap } from 'react-leaflet';
import api from '../../services/api';
import { Brain, AlertTriangle } from 'lucide-react';

interface IntelligenceLayerProps {
    cityId?: string;
    visible: boolean;
    centerLat?: number;
    centerLng?: number;
}

export function IntelligenceLayer({ cityId, visible, centerLat = 20.5937, centerLng = 78.9629 }: IntelligenceLayerProps) {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        if (!visible) return;

        const loadEvents = async () => {
            try {
                const res = await api.get('/intelligence/events');
                if (res.data.success) {
                    setEvents(res.data.data.filter((e: any) => e.status !== 'RESOLVED' && e.status !== 'FALSE_POSITIVE'));
                }
            } catch (err) {
                console.error("Failed to load intelligence events for map.");
            }
        };
        loadEvents();
        // Since we want live updates, we'd normally bind websocket here too, but for map overlay polling/refresh on mount is fine.
    }, [visible, cityId]);

    if (!visible || events.length === 0) return null;

    // We don't have strict lat/lng in the intelligence events yet, so we cluster them around the city center
    return (
        <>
            {events.map((ev, index) => {
                // Procedural jitter to avoid complete overlap if they target city center exactly
                const jlat = centerLat + (Math.sin(index) * 0.015);
                const jlng = centerLng + (Math.cos(index) * 0.015);

                const color = ev.severity === 'CRITICAL' ? '#ef4444' : ev.severity === 'HIGH' ? '#f97316' : '#6366f1';

                return (
                    <CircleMarker
                        key={ev._id}
                        center={[jlat, jlng]}
                        radius={15}
                        pathOptions={{ color: color, fillColor: color, fillOpacity: 0.6, weight: 3 }}
                    >
                        <Popup className="intelligence-popup">
                            <div className="p-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                    <Brain className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-slate-800 text-sm">AI Alert</h3>
                                </div>
                                <div className="mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white`} style={{ backgroundColor: color }}>
                                        {ev.severity} RISK
                                    </span>
                                </div>
                                <p className="text-slate-800 font-semibold mb-1">{ev.title}</p>
                                <p className="text-slate-500 text-xs mb-3">{ev.summary}</p>

                                <a href={`/admin/intelligence/${ev._id}`} target="_blank" rel="noreferrer" className="block text-center w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs py-1.5 rounded transition-colors">
                                    Analyze Details
                                </a>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}
