'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, GitMerge, Settings2, BarChart4, AlertTriangle, ShieldCheck, FileWarning, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function apiPost(path: string, token: string) {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return res.json();
}

export default function OptimizationDashboard() {
    const [capacity, setCapacity] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [actioningId, setActioningId] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const [capRes, recsRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/optimization/capacity`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/v1/optimization/recommendations`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (capRes.ok) setCapacity((await capRes.json()).data);
            if (recsRes.ok) setRecommendations((await recsRes.json()).data ?? []);
        } catch (error) {
            console.error('Optimization fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void fetchAll(); }, [fetchAll]);

    const handleGenerate = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setGenerating(true);
        try {
            await apiPost('/optimization/recommendations/generate', token);
            await fetchAll();
        } catch (err) {
            console.error('Generate error:', err);
        } finally {
            setGenerating(false);
        }
    };

    const handleAccept = async (recId: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setActioningId(recId);
        try {
            const data = await apiPost(`/optimization/recommendations/${recId}/accept`, token);
            if (data.success) {
                setRecommendations(prev => prev.map(r => r._id === recId ? data.data : r));
            } else {
                alert(`Error: ${data.message || 'Accept failed'}`);
            }
        } catch (err) {
            console.error('Accept error:', err);
        } finally {
            setActioningId(null);
        }
    };

    const handleReject = async (recId: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setActioningId(recId);
        try {
            const data = await apiPost(`/optimization/recommendations/${recId}/reject`, token);
            if (data.success) {
                setRecommendations(prev => prev.filter(r => r._id !== recId));
            } else {
                alert(`Error: ${data.message || 'Reject failed'}`);
            }
        } catch (err) {
            console.error('Reject error:', err);
        } finally {
            setActioningId(null);
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'GENERATED': return 'bg-slate-800 text-slate-300 border-slate-700';
            case 'UNDER_REVIEW': return 'bg-yellow-900/40 text-yellow-500 border-yellow-700/50';
            case 'ACCEPTED': return 'bg-emerald-900/40 text-emerald-500 border-emerald-700/50';
            case 'APPLIED': return 'bg-indigo-900/40 text-indigo-400 border-indigo-700/50';
            case 'REJECTED': return 'bg-rose-900/40 text-rose-400 border-rose-700/50';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2">
                        <GitMerge className="w-8 h-8 text-fuchsia-500" /> Optimization &amp; Capacity Planning
                    </h1>
                    <p className="text-slate-400">Deterministic capacity simulation, resource assignment and what-if heuristics.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-5 py-2.5 bg-fuchsia-700 hover:bg-fuchsia-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Generating…' : 'Generate Recommendations'}
                    </button>
                    <Link href="/admin/optimization/scenarios" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-2 border border-slate-700 font-medium transition-colors">
                        <BarChart4 className="w-4 h-4 text-fuchsia-400" /> Scenario Builder
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse text-fuchsia-500/50 flex flex-col items-center justify-center p-20">
                    <Settings2 className="animate-spin w-8 h-8 mb-4" /> Analyzing Physical Constraints…
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Live Capacity Matrix */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Baseline Capacity Determinators
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <CapacityCard
                                label="EV Station Grid"
                                value={capacity?.domains?.ev?.utilizationScore ?? 0}
                                suffix="Peak Saturation"
                                color="fuchsia"
                                alert={capacity?.domains?.ev?.hasShortage}
                            />
                            <CapacityCard
                                label="Garbage Logistics"
                                value={capacity?.domains?.garbage?.utilizationScore ?? 0}
                                suffix="Fleet Active"
                                color="amber"
                            />
                            <CapacityCard
                                label="Water Storage Grid"
                                value={capacity?.domains?.water?.fillScore ?? 0}
                                suffix="Total Fill"
                                color="cyan"
                                alert={capacity?.domains?.water?.hasShortage}
                            />
                            <CapacityCard
                                label="Electricity Transformer"
                                value={capacity?.domains?.electricity?.utilizationScore ?? 0}
                                suffix="Total Output"
                                color="yellow"
                                alert={capacity?.domains?.electricity?.hasShortage}
                            />
                        </div>
                    </section>

                    {/* Recommendations Feed */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-4">
                            <Zap className="w-5 h-5 text-amber-400" /> Human-in-the-Loop Actionable Directives
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {recommendations.length === 0 ? (
                                <div className="p-12 text-center border-dashed border border-slate-800 rounded-2xl bg-slate-900/30">
                                    <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <h3 className="text-slate-400 font-semibold text-lg">System Operation Nominal</h3>
                                    <p className="text-slate-600 text-sm mt-1">No bottlenecks detected. Click &quot;Generate Recommendations&quot; to run analysis.</p>
                                </div>
                            ) : (
                                recommendations.map(rec => (
                                    <div key={rec._id} className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden shadow-xl hover:border-fuchsia-500/50 transition-colors">
                                        <div className="p-6 md:flex justify-between items-start gap-4 space-y-4 md:space-y-0">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusTheme(rec.status)} uppercase tracking-wider`}>
                                                        {rec.status}
                                                    </span>
                                                    <span className="text-slate-500 text-xs font-mono">{rec.service} {"//"} {rec.optimizationType}</span>
                                                    <span className="text-slate-600 text-xs font-mono">conf: {rec.confidence}%</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-100 mb-1">{rec.title}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">{rec.summary}</p>
                                            </div>

                                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl min-w-[260px]">
                                                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Expected Impact</h4>
                                                {Object.entries(rec.expectedImpact ?? {}).map(([key, val]) => (
                                                    <div key={key} className="flex justify-between items-center border-b border-slate-800 last:border-0 py-1.5 text-sm">
                                                        <span className="text-slate-400">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                                                        <span className="font-mono text-emerald-400 font-bold">{String(val)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end gap-3 px-6">
                                            <Link href={`/admin/optimization/${rec._id}`} className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 flex items-center gap-2">
                                                <FileWarning className="w-4 h-4" /> Review Full Context
                                            </Link>
                                            {['GENERATED', 'UNDER_REVIEW'].includes(rec.status) && (
                                                <>
                                                    <button
                                                        disabled={actioningId === rec._id}
                                                        onClick={() => handleReject(rec._id)}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-rose-900/50 disabled:opacity-50 text-slate-300 hover:text-rose-300 rounded-lg border border-slate-700 font-bold text-sm flex items-center gap-2 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Reject
                                                    </button>
                                                    <button
                                                        disabled={actioningId === rec._id}
                                                        onClick={() => handleAccept(rec._id)}
                                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-colors"
                                                    >
                                                        {actioningId === rec._id ? 'Processing…' : 'Accept Directive'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function CapacityCard({ label, value, suffix, color, alert }: {
    label: string; value: number; suffix: string; color: string; alert?: boolean;
}) {
    const barColor = { fuchsia: 'bg-fuchsia-500', amber: 'bg-amber-500', cyan: 'bg-cyan-500', yellow: 'bg-yellow-500' }[color] ?? 'bg-slate-500';
    const borderHover = { fuchsia: 'hover:border-fuchsia-500/30', amber: 'hover:border-amber-500/30', cyan: 'hover:border-cyan-500/30', yellow: 'hover:border-yellow-500/30' }[color] ?? '';
    return (
        <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 group ${borderHover} transition-all`}>
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <div className="text-3xl font-bold text-white mb-2">
                {value}% <span className="text-sm font-normal text-slate-500">{suffix}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className={`${barColor} h-full transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }} />
            </div>
            {alert && (
                <p className="text-xs text-rose-500 font-bold mt-3 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Critical Limit Hit
                </p>
            )}
        </div>
    );
}
