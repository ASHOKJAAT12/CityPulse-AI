'use client';

import { useEffect, useState } from 'react';
import { streetlightService, StreetlightAsset, StreetlightZone } from '../../../services/streetlight.service';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('../../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../../components/map').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('../../../components/map').then(m => m.Popup), { ssr: false });

export default function StreetlightDashboard() {
    const [assets, setAssets] = useState<StreetlightAsset[]>([]);
    const [zones, setZones] = useState<StreetlightZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<StreetlightAsset | null>(null);
    const [overrideState, setOverrideState] = useState('AUTO');
    const [brightness, setBrightness] = useState(100);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [aRes, zRes] = await Promise.all([
                streetlightService.getAssets(),
                streetlightService.getZones()
            ]);
            setAssets(aRes.data?.data || aRes.data || []);
            setZones(zRes.data?.data || zRes.data || []);
        } catch (e) {
            console.error('Failed to load streetlights', e);
        } finally {
            setLoading(false);
        }
    }

    const handleOverride = async () => {
        if (!selectedAsset) return;
        try {
            await streetlightService.overrideState(selectedAsset._id, overrideState, brightness);
            await loadData();
            setSelectedAsset(null);
            alert('Override command sent successfully');
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Failed to send override');
        }
    };

    return (
        <div className="p-6 font-sans">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 border-b pb-2">Smart Streetlight Command Center</h1>
                <p className="text-gray-500 mt-2 text-sm">Zone-level management, power anomalies, and deterministic overrides.</p>
            </header>

            <div className="flex gap-6 h-[75vh]">
                <aside className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
                    <div className="bg-white rounded-xl shadow p-4 border border-blue-100 flex-1">
                        <h2 className="font-semibold text-gray-800 mb-4 sticky top-0 bg-white z-10 pb-2 border-b">Asset Directory ({assets.length})</h2>
                        {loading ? <p className="text-gray-400 text-sm">Loading infrastructure...</p> : (
                            <div className="flex flex-col gap-3">
                                {assets.map(asset => (
                                    <div
                                        key={asset._id}
                                        className={`p-3 relative rounded-lg border-2 cursor-pointer transition-all hover:bg-slate-50 ${selectedAsset?._id === asset._id ? 'border-orange-400 bg-orange-50' : 'border-gray-100'}`}
                                        onClick={() => setSelectedAsset(asset)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-800">{asset.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">{asset.assetCode}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${asset.status === 'ON' ? 'bg-amber-100 text-amber-700' :
                                                asset.status === 'OFF' ? 'bg-gray-200 text-gray-700' :
                                                    asset.status === 'DIMMED' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-400">
                                            Zone: {asset.zoneId?.name || 'Unmapped'} | Type: {asset.assetType}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="flex-1 flex flex-col gap-4">
                    {selectedAsset && (
                        <div className="bg-white rounded-xl border-l-4 border-l-orange-500 shadow p-5">
                            <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                                ⚡ Manual Control Override: {selectedAsset.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Overrides bypass preset schedule evaluations.</p>

                            <div className="flex gap-4">
                                <select
                                    className="p-2 border rounded-md text-sm bg-gray-50 outline-none focus:border-orange-500"
                                    value={overrideState}
                                    onChange={e => setOverrideState(e.target.value)}
                                >
                                    <option value="AUTO">AUTO (Schedule Default)</option>
                                    <option value="ON">Force ON</option>
                                    <option value="OFF">Force OFF</option>
                                    <option value="DIMMED">Force DIMMED</option>
                                </select>

                                {overrideState === 'DIMMED' && (
                                    <div className="flex items-center gap-2 flex-1">
                                        <label className="text-xs font-semibold text-gray-600">Level: {brightness}%</label>
                                        <input type="range" className="flex-1 accent-orange-500" min="10" max="90" step="10" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} />
                                    </div>
                                )}

                                <button
                                    onClick={handleOverride}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors"
                                >
                                    Transmit Command
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden relative border shadow-inner">
                        {assets.length > 0 && typeof window !== 'undefined' ? (
                            <MapView center={{ lat: assets[0].location.coordinates[1], lng: assets[0].location.coordinates[0] }} zoom={14} className="w-full h-full">
                                {assets.map(a => (
                                    <Marker
                                        key={a._id}
                                        position={{ lat: a.location.coordinates[1], lng: a.location.coordinates[0] }}
                                        label={a.name}
                                        popup={<Popup><div><strong>{a.assetCode}</strong><br />Status: {a.status}</div></Popup>}
                                    />
                                ))}
                            </MapView>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Map initialization pending...</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
