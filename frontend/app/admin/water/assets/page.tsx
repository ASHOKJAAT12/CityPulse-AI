'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Activity, Trash } from 'lucide-react';
import api from '../../../../services/api';

export default function WaterAssetsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/water/assets/admin')
            .then((res: any) => setAssets(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium">Loading water assets...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Water Assets</h1>
                    <p className="text-slate-500 mt-1">Manage infrastructure nodes like tanks and pipelines.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Asset
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search assets by name or code..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>
                {assets.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No assets found.</div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {assets.map((asset) => (
                            <li key={asset._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        {asset.assetType[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{asset.name}</p>
                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.assetCode} • {asset.assetType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${asset.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        asset.status === 'FAULT' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
