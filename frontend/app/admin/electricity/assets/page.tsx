'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Zap, Trash } from 'lucide-react';
import api from '../../../../services/api';

export default function ElectricityAssetsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/electricity/assets/admin')
            .then((res: any) => setAssets(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this grid asset?')) return;
        try {
            await api.delete(`/admin/electricity/assets/${id}`);
            setAssets(assets.filter(a => a._id !== id));
        } catch (error) {
            console.error('Failed to delete asset', error);
            alert('Failed to delete asset. It may have attached sensors.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Grid Assets</h1>
                    <p className="text-slate-500">Manage substations, transformers, and distribution panels.</p>
                </div>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Asset
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search assets by name or code..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Asset Name</th>
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Capacity</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading assets...</td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No assets found.</td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset._id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-amber-600" />
                                            </div>
                                            {asset.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{asset.assetCode}</td>
                                        <td className="px-6 py-4 text-slate-600">{asset.assetType}</td>
                                        <td className="px-6 py-4 text-slate-600">{asset.capacity || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                ${asset.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                    asset.status === 'FAULT' ? 'bg-red-100 text-red-700' :
                                                        asset.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-700'}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(asset._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
