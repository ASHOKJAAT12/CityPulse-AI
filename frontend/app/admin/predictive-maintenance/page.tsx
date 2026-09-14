'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Wrench, Clock, Search, Filter, ShieldAlert, ArrowRight, Activity, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PredictiveMaintenancePage() {
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                // Fake network delay for demo
                const response = await fetch('/api/v1/predictive-maintenance', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPredictions(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPredictions();
    }, []);

    // Fake data injection for showing the design
    const displayRisks = predictions.length > 0 ? predictions : [
        { _id: 'r1', service: 'WATER', assetType: 'Valve', assetId: 'v-1092', predictionType: 'FAILURE', riskScore: 85, severity: 'HIGH', confidence: 92, predictionHorizon: 'within 48 hours', modelName: 'water-flow-baseline-v1', recommendedActions: ['Dispatch technician', 'Isolate water line'], status: 'GENERATED', createdAt: new Date().toISOString() },
        { _id: 'r2', service: 'ELECTRICITY', assetType: 'Transformer', assetId: 'tx-22', predictionType: 'OVERLOAD', riskScore: 68, severity: 'MEDIUM', confidence: 80, predictionHorizon: 'within 5 days', modelName: 'electrical-grid-stats-v2', recommendedActions: ['Reduce load', 'Thermal scan'], status: 'GENERATED', createdAt: new Date().toISOString() },
        { _id: 'r3', service: 'TRAFFIC', assetType: 'Intersection', assetId: 'junc-44', predictionType: 'DEGRADATION', riskScore: 92, severity: 'CRITICAL', confidence: 95, predictionHorizon: 'within 12 hours', modelName: 'traffic-bottleneck-rnn-v0', recommendedActions: ['Reroute traffic', 'Inspect sensor array'], status: 'REVIEWED', createdAt: new Date().toISOString() }
    ];

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
            case 'MEDIUM': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
            default: return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-rose-500 to-pink-500 tracking-tight flex items-center gap-3">
                        <AlertTriangle className="w-10 h-10 text-orange-500" />
                        Predictive Maintenance
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">AI-driven actionable insights for proactive infrastructure maintenance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-medium transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <Link href="/admin/digital-twin" className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2">
                        <MapPin className="w-5 h-5" /> View on Map
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-red-950/50 to-slate-900 border border-red-900/50 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert className="w-24 h-24" />
                    </div>
                    <div className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        CRITICAL RISKS
                    </div>
                    <div className="text-5xl font-bold text-white">
                        {displayRisks.filter(r => r.severity === 'CRITICAL').length}
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="text-sm font-semibold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        HIGH RISKS
                    </div>
                    <div className="text-5xl font-bold text-white">
                        {displayRisks.filter(r => r.severity === 'HIGH').length}
                    </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="text-sm font-semibold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        UPCOMING (7 DAYS)
                    </div>
                    <div className="text-5xl font-bold text-white">
                        {displayRisks.length}
                    </div>
                </div>
            </div>

            {/* AI Risk Inbox / Feed */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-rose-500" />
                        Identified Failure Vectors
                    </h2>
                    <div className="mt-4 md:mt-0 relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" placeholder="Search assets..." className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 text-white placeholder-slate-500 transition-all" />
                    </div>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {displayRisks.map((risk) => (
                        <div key={risk._id} className="p-5 md:p-6 hover:bg-slate-800/40 transition-colors group flex flex-col lg:flex-row gap-6 items-start lg:items-center">

                            <div className="flex items-center gap-4 min-w-[220px]">
                                <div className={`p-3 rounded-xl border ${getSeverityStyles(risk.severity)}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400 font-medium mb-0.5">{risk.service} / {risk.assetType}</div>
                                    <div className="text-lg font-bold text-white">{risk.assetId}</div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Prediction</div>
                                    <div className="text-slate-200 font-medium">{risk.predictionType}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Timeline</div>
                                    <div className="text-slate-200 font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-orange-400" /> {risk.predictionHorizon}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Confidence</div>
                                    <div className="text-slate-200 font-medium">{risk.confidence}%</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">AI Model</div>
                                    <div className="text-slate-400 font-mono text-sm max-w-[120px] truncate" title={risk.modelName}>{risk.modelName}</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[200px] w-full lg:w-auto mt-4 lg:mt-0">
                                <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors border border-slate-700 hover:border-slate-600">
                                    <Wrench className="w-4 h-4" /> Create Work Order
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 rounded-lg text-sm font-semibold transition-colors border border-orange-500/20 hover:border-orange-500/40 group-hover:bg-orange-600/20">
                                    Review Details <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {displayRisks.length === 0 && !loading && (
                        <div className="text-center py-16 text-slate-500">
                            <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No predictive risks identified for infrastructure assets currently.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
