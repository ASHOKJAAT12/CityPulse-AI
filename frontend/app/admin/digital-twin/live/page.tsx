'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Network, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import api from '../../../../services/api';

const MapView = dynamic(() => import('../../../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../../../components/map').then(m => m.Marker), { ssr: false });

export default function DigitalTwinLivePage() {
    const [criticalNodes, setCriticalNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCriticalState = async () => {
        try {
            // Using query ?status constraints or fetching all and filtering depending on backend flexibility
            const res = await api.get('/digital-twin/nodes?status=CRITICAL&limit=500');
            const resWarn = await api.get('/digital-twin/nodes?status=WARNING&limit=500');
            const resFault = await api.get('/digital-twin/nodes?status=FAULT&limit=500');

            let combined = [];
            if (res.data.success) combined.push(...res.data.data.nodes);
            if (resWarn.data.success) combined.push(...resWarn.data.data.nodes);
            if (resFault.data.success) combined.push(...resFault.data.data.nodes);

            setCriticalNodes(combined);
        } catch (err) {
            console.error("Failed to load Live Twin", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCriticalState();
        const poller = setInterval(() => { fetchCriticalState() }, 10_000); // 10 second Live Sync
        return () => clearInterval(poller);
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <div className="animate-pulse flex flex-col items-center">
                <AlertTriangle className="w-16 h-16 text-rose-600 mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-slate-100">Synchronizing Live Grid...</h2>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] -m-6 flex bg-zinc-900 overflow-hidden text-white">
            {/* Viewport Map Area */}
            <div className="flex-1 relative">
                <MapView center={{ lat: 20.5937, lng: 78.9629 }} zoom={5} className="w-full h-full relative z-0">
                    {criticalNodes.map(node => (
                        <Marker
                            key={node._id}
                            position={{ lat: node.location.coordinates[1], lng: node.location.coordinates[0] }}
                            label={node.name}
                            icon="alert"
                        />
                    ))}
                </MapView>
            </div>

            {/* Overload Explorer Panel */}
            <div className="w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col z-10 shadow-2xl relative">
                <div className="p-4 border-b border-rose-900/50 bg-rose-950/20">
                    <h2 className="text-lg font-bold text-rose-500 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 animate-pulse" />
                        CRITICAL INFRASTRUCTURE
                    </h2>
                    <p className="text-xs text-rose-300 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Live Sync Active
                    </p>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {criticalNodes.length > 0 ? (
                        criticalNodes.map(node => (
                            <div key={node._id} className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 hover:border-rose-800 transition-colors cursor-pointer">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400/70 mb-1">{node.domain} &bull; {node.entityType}</div>
                                <h3 className="font-bold text-zinc-100">{node.name}</h3>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-900/30">
                                        {node.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-48 text-zinc-600">
                            <Network className="w-12 h-12 mb-3 text-emerald-600/50" />
                            <p className="text-sm px-8 font-medium">No critical infrastructure events detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
