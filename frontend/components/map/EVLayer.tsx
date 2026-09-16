import React, { useEffect, useState } from 'react';
import { Marker, Popup } from './index';
import api from '../../services/api';
import { Zap, BatteryCharging, Power } from 'lucide-react';

interface EVLayerProps {
    cityId: string;
}

export function EVLayer({ cityId }: EVLayerProps) {
    const [stations, setStations] = useState<any[]>([]);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await api.get(`/ev/${cityId}/stations`);
                if (res.data.success) {
                    setStations(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load EV stations", error);
            }
        };

        if (cityId) {
            fetchStations();
        }
    }, [cityId]);

    if (!stations.length) return null;

    return (
        <>
            {stations.map(station => {
                const isOnline = station.status === 'OPERATIONAL' || station.status === 'LIMITED';
                const lat = station.location?.coordinates?.[1] || 0;
                const lng = station.location?.coordinates?.[0] || 0;

                if (!lat || !lng) return null;

                return (
                    <Marker
                        key={station._id}
                        position={{ lat, lng }}
                        label={station.name}
                        icon="ev"
                        popup={
                            <div className="min-w-[200px] p-1">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                    <div className={`p-1.5 rounded-md ${isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight m-0">{station.name}</h4>
                                        <p className="text-xs text-slate-500 m-0">{station.stationType} • {station.operator}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 flex items-center gap-1"><BatteryCharging className="w-3 h-3" /> Connectors:</span>
                                        <span className="font-medium text-slate-700">{station.availableConnectors} / {station.totalConnectors} Available</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 flex items-center gap-1"><Power className="w-3 h-3" /> Status:</span>
                                        <span className={`font-medium ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>{station.status}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100 italic">
                                    {station.address}
                                </div>
                            </div>
                        }
                    />
                );
            })}
        </>
    );
}
