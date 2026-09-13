'use client';

import { useAuth } from '../../../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { Brain, ArrowLeft, ShieldAlert, Cpu, Activity, Lightbulb, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../services/api';

interface IntelligenceDetailResponse {
    event: any;
    anomalies: any[];
    risks: any[];
    predictions: any[];
    recommendations: any[];
}

export default function IntelligenceEventDetail() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<IntelligenceDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const eventId = params?.id as string;

    const fetchData = async () => {
        try {
            const res = await api.get(`/intelligence/events/${eventId}`);
            setData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch intelligence details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && eventId) fetchData();
    }, [user, eventId]);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this intelligence event as ${newStatus}?`)) return;
        setIsUpdating(true);
        try {
            await api.patch(`/intelligence/events/${eventId}/status`, {
                status: newStatus,
                operatorNotes: `Marked as ${newStatus} by human operator.`
            });
            fetchData();
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Brain className="w-10 h-10 text-indigo-500 animate-pulse" />
            </div>
        );
    }

    if (!data?.event) return <div className="p-8 text-center text-slate-500">Event not found.</div>;

    const { event, recommendations, anomalies } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <Link href="/admin/intelligence" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Command Center
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                                    event.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                        event.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                            'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}>
                                {event.severity} RISK
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                                {event.service}
                            </span>
                            <span className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-full shadow-sm">
                                {event.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{event.title}</h1>
                        <p className="text-slate-500 mt-2 max-w-3xl">{event.summary}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-shrink-0">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-500">AI Confidence</p>
                            <p className="text-2xl font-black text-slate-800">{event.confidence}%</p>
                        </div>
                        <div className="h-10 w-px bg-slate-200 mx-2"></div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-500">Risk Score</p>
                            <p className="text-2xl font-black text-slate-800">{event.riskScore}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-indigo-300" />
                        <h2 className="text-lg font-semibold text-indigo-100">AI Recommendations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((rec: any) => (
                            <div key={rec._id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                                <h3 className="font-bold text-lg">{rec.title}</h3>
                                <p className="text-indigo-200 text-sm mt-1">{rec.description}</p>
                                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-indigo-300">
                                    <span className="font-semibold text-white">Reasoning: </span> {rec.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evidence Engine */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-indigo-500" />
                            Evidence Trail
                        </h2>
                    </div>

                    <ul className="space-y-4">
                        {event.evidence.map((evStr: string, idx: number) => (
                            <li key={idx} className="flex gap-3 text-slate-600 bg-slate-50 rounded-xl p-4">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{evStr}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Anomalies Detected */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-rose-500" />
                            Recent Sensory Anomalies
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {anomalies.map((anom: any) => (
                            <div key={anom._id} className="p-4 border border-slate-100 rounded-xl flex items-start justify-between bg-slate-50">
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{anom.metric} (Deviation: {anom.deviation.toFixed(1)})</h4>
                                    <p className="text-xs text-slate-500 mt-1">Observed: {anom.observedValue} | Expected: {anom.expectedValue.toFixed(1)}</p>
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-md">{anom.severity}</span>
                            </div>
                        ))}
                        {anomalies.length === 0 && (
                            <p className="text-slate-500 text-center py-4">No recent raw anomalies found for this service space.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Human in the loop controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between mt-8">
                <div>
                    <h3 className="font-bold text-slate-800">Operator Resolution</h3>
                    <p className="text-sm text-slate-500">Provide feedback to the AI model by validating or dismissing this event.</p>
                </div>
                <div className="flex gap-3">
                    {event.status !== 'RESOLVED' && event.status !== 'FALSE_POSITIVE' && (
                        <>
                            <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('FALSE_POSITIVE')}
                                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50">
                                False Positive
                            </button>
                            <button
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('RESOLVED')}
                                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                                Validate & Resolve
                            </button>
                        </>
                    )}
                    {event.status === 'RESOLVED' && (
                        <div className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Case Closed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
