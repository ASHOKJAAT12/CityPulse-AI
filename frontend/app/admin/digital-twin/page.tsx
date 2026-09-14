'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Network, Activity, Layers, Search, Map as MapIcon, Database } from 'lucide-react';
import api from '../../../services/api';

const MapView = dynamic(() => import('../../../components/map').then(m => m.MapView), { ssr: false });
const Marker = dynamic(() => import('../../../components/map').then(m => m.Marker), { ssr: false });

export default function DigitalTwinPage() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [relationships, setRelationships] = useState<any[]>([]);
    const [risks, setRisks] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const [sumRes, nodesRes, riskRes] = await Promise.all([
                    api.get('/digital-twin/summary'),
                    api.get('/digital-twin/nodes?limit=1000'), // Bounded spatial load
                    api.get('/predictions/risk-map') // Phase 18 Prediction Integration
                ]);

                if (sumRes.data.success) setSummary(sumRes.data.data);
                if (nodesRes.data.success) setNodes(nodesRes.data.data.nodes);
                if (riskRes.data) setRisks(riskRes.data);
            } catch (err) {
                console.error("Failed to load Digital Twin", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialState();
    }, []);

    const fetchTopology = async (nodeId: string) => {
        try {
            const res = await api.get(`/digital-twin/relationships?nodeId=${nodeId}`);
            if (res.data.success) {
                setRelationships(res.data.data.relationships);
            }
        } catch (err) {
            console.error("Topology failed", err);
        }
    };

    const handleNodeSelect = (node: any) => {
        setSelectedNode(node);
        fetchTopology(node._id);
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <Network className="w-16 h-16 text-indigo-600 mb-4 animate-spin-slow" />
                <h2 className="text-xl font-bold text-slate-800">Initializing Digital Twin Matrix...</h2>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-64px)] -m-6 flex bg-slate-100 overflow-hidden">
            {/* Viewport Map Area */}
            <div className="flex-1 relative">
                <MapView center={{ lat: 20.5937, lng: 78.9629 }} zoom={5} className="w-full h-full">
                    {nodes.map(node => {
                        const matchingRisk = risks.find(r => r.assetId === node.entityId);
                        const isAtRisk = !!matchingRisk;
                        return (
                            <Marker
                                key={node._id}
                                position={{ lat: node.location.coordinates[1], lng: node.location.coordinates[0] }}
                                label={isAtRisk ? `[PREDICTED RISK] ${node.name}` : node.name}
                                icon={isAtRisk ? 'alert' : (node.status === 'CRITICAL' ? 'alert' : 'default')}
                                onClick={() => handleNodeSelect({ ...node, predictiveRisk: matchingRisk })}
                            />
                        );
                    })}
                </MapView>

                {/* Heads Up Display Overlay */}
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur shadow-lg p-4 rounded-xl border border-slate-200 w-64 pointer-events-auto">
                    <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Live Overview
                    </h2>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mb-2">
                        <span className="text-sm font-medium">Synced Nodes</span>
                        <span className="text-lg font-bold text-indigo-600">{summary?.nodes || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                        <span className="text-sm font-medium">Relationships</span>
                        <span className="text-lg font-bold text-rose-600">{summary?.relationships || 0}</span>
                    </div>
                </div>
            </div>

            {/* Object Explorer Panel */}
            <div className="w-96 bg-white border-l border-slate-200 flex flex-col z-10 shadow-2xl relative">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Network className="w-5 h-5 text-indigo-600" />
                        Object Explorer
                    </h2>
                    <div className="mt-3 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input type="text" placeholder="Search Infrastructure..." className="w-full bg-slate-100 border-none rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedNode ? (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{selectedNode.domain} &bull; {selectedNode.entityType}</div>
                                <h3 className="text-xl font-bold text-slate-800">{selectedNode.name}</h3>
                                <div className="mt-4 flex gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedNode.status === 'ONLINE' || selectedNode.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {selectedNode.status}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> {selectedNode.health}% Health
                                    </span>
                                </div>
                            </div>

                            {/* Phase 18 - Predictive Risk Overlay */}
                            {selectedNode.predictiveRisk && (
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Activity className="w-16 h-16 text-orange-600" />
                                    </div>
                                    <h4 className="font-bold text-orange-700 text-sm mb-2 flex items-center gap-2 uppercase tracking-wide">
                                        AI Risk Assessment
                                    </h4>
                                    <div className="font-medium text-slate-700 mt-1">
                                        {selectedNode.predictiveRisk.predictionType} predicted {selectedNode.predictiveRisk.predictionHorizon}.
                                    </div>
                                    <div className="text-sm font-bold text-orange-600 mt-2">
                                        Confidence: {selectedNode.predictiveRisk.confidence}% &bull; Severity: {selectedNode.predictiveRisk.severity}
                                    </div>
                                    <div className="mt-3 text-xs text-orange-600/70 py-1 px-2 bg-orange-100 rounded inline-block font-mono">
                                        Model: {selectedNode.predictiveRisk.modelName}
                                    </div>
                                </div>
                            )}

                            {/* Topological Graph Preview */}
                            {relationships.length > 0 && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-indigo-600" /> Dependencies
                                    </h4>
                                    <div className="space-y-2">
                                        {relationships.map(rel => {
                                            const isSource = rel.sourceNodeId._id === selectedNode._id;
                                            const peer = isSource ? rel.targetNodeId : rel.sourceNodeId;
                                            return (
                                                <div key={rel._id} className="text-sm bg-white p-2 rounded border border-slate-200">
                                                    <span className="text-slate-400 text-xs uppercase">{isSource ? 'Outbound' : 'Inbound'} &bull; {rel.relationshipType}</span>
                                                    <div className="font-medium text-slate-700 mt-0.5">{peer.name}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-48 text-slate-400">
                            <MapIcon className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="text-sm px-8">Select an infrastructure node on the map to inspect its topology graph and operational state.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
