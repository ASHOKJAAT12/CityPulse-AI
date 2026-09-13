'use client';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Marker, Popup } from './index';

interface ElectricityLayerProps {
    cityId: string;
    visible?: boolean;
}

export function ElectricityLayer({ cityId, visible = true }: ElectricityLayerProps) {
    const [assets, setAssets] = useState<any[]>([]);

    useEffect(() => {
        if (!cityId || !visible) return;

        let active = true;
        const fetchAssets = async () => {
            try {
                const res = await api.get(`/city/electricity/assets`);
                if (active) setAssets(res.data.data);
            } catch (err) {
                console.error('Failed to fetch grid assets', err);
            }
        };
        fetchAssets();

        return () => { active = false; };
    }, [cityId, visible]);

    if (!visible) return null;

    return (
        <>
            {assets.map((asset) => {
                if (!asset.location || !asset.location.coordinates) return null;
                const [lng, lat] = asset.location.coordinates;

                let iconType: 'default' | 'garbage' | 'ev' | 'alert' | 'city' = 'default';
                if (asset.status === 'FAULT' || asset.status === 'MAINTENANCE') {
                    iconType = 'alert';
                } else {
                    iconType = 'ev'; // Using EV icon as the closest electrical analog from mapbox standard if possible, else default
                }

                return (
                    <Marker
                        key={asset._id}
                        position={{ lat, lng }}
                        label={asset.name}
                        icon={iconType}
                        popup={
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{asset.name}</h3>
                                <p className="text-xs text-slate-500 mb-2">{asset.assetType.replace('_', ' ')}</p>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${asset.status === 'FAULT' ? 'bg-red-100 text-red-700' :
                                    asset.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    Status: {asset.status}
                                </span>
                            </div>
                        }
                    />
                );
            })}
        </>
    );
}
