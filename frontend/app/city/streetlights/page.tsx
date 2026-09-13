'use client';

import { useEffect, useState } from 'react';
import { streetlightService, StreetlightAsset } from '../../../services/streetlight.service';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MapView = dynamic(() => import('../../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../../components/map').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('../../../components/map').then(m => m.Popup), { ssr: false });

export default function StreetlightPublicView() {
    const [assets, setAssets] = useState<StreetlightAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Ideally a dedicated public endpoint, simulating here
            const res = await streetlightService.getAssets();
            setAssets(res.data?.data || res.data || []);
        } catch (e) {
            console.error('Failed to load public infrastructure', e);
        } finally {
            setLoading(false);
        }
    }

    const faultyCount = assets.filter(a => a.status === 'FAULT' || a.status === 'OFFLINE').length;
    const activeCount = assets.filter(a => a.status === 'ON' || a.status === 'DIMMED').length;

    return (
        <div className="font-sans">
            <header className="p-6 border-b flex justify-between items-center bg-white shadow-sm relative z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 border-b pb-2">City Lighting Network</h1>
                    <p className="text-gray-500 mt-2 text-sm">Public visibility into municipal illumination infrastructure and safety corridors.</p>
                </div>
                <Link href="/city/map" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                    View Master Map
                </Link>
            </header>

            <div className="flex bg-gray-50 h-[calc(100vh-140px)] p-6 gap-6">
                <aside className="w-80 bg-white rounded-xl shadow p-5 border flex flex-col gap-4 sticky">
                    <h2 className="font-bold text-lg border-b pb-2">Network Health</h2>

                    <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex justify-between items-center border border-emerald-100">
                        <span className="font-semibold text-sm">Active Lights</span>
                        <span className="text-2xl font-black">{activeCount}</span>
                    </div>

                    <div className="bg-red-50 text-red-800 p-4 rounded-lg flex justify-between items-center border border-red-100">
                        <span className="font-semibold text-sm">Faults Detected</span>
                        <span className="text-2xl font-black">{faultyCount}</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-auto leading-relaxed">
                        Data reflects live telemetry from smart controllers bounding city sectors. Anomaly resolutions are dispatched autonomously to maintenance crews.
                    </p>
                </aside>

                <main className="flex-1 rounded-xl overflow-hidden bg-slate-200 border relative shadow-inner">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-400">Loading Geospatial Data...</div>
                    ) : (
                        <MapView
                            center={assets.length > 0 ? { lat: assets[0].location.coordinates[1], lng: assets[0].location.coordinates[0] } : { lat: 20, lng: 77 }}
                            zoom={13}
                            className="w-full h-full"
                        >
                            {assets.map(a => (
                                <Marker
                                    key={a._id}
                                    position={{ lat: a.location.coordinates[1], lng: a.location.coordinates[0] }}
                                    label="💡"
                                    popup={<Popup><div><strong>{a.name}</strong><br />{a.status === 'FAULT' ? '⚠️ Attention Required' : '✅ Operational'}</div></Popup>}
                                />
                            ))}
                        </MapView>
                    )}
                </main>
            </div>
        </div>
    );
}
