'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, ArrowRight, Zap, Target, History, Activity, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export default function OptimizationPlanDetail() {
    const params = useParams();
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(`${API_BASE}/api/v1/optimization/recommendations/${params.id as string}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setPlan(data.data);
                }
            } catch (err) {
                console.error('Fetch plan error:', err);
            } finally {
                setLoading(false);
            }
        };

        void fetchPlan();
    }, [params.id]);

    const handleAction = async (actionType: 'accept' | 'reject' | 'apply') => {
        setActioning(true);
        setActionError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(
                `${API_BASE}/api/v1/optimization/recommendations/${params.id as string}/${actionType}`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setActionError(data.message || `${actionType} operation failed`);
                return;
            }

            if (actionType === 'apply') {
                router.push('/admin/optimization');
            } else if (actionType === 'reject') {
                router.push('/admin/optimization');
            } else {
                // accept — refresh plan state
                setPlan(data.data);
            }

        } catch (err) {
            console.error('Action error:', err);
            setActionError('Network error. Please try again.');
        } finally {
            setActioning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
                Evaluating Optimization Constraints…
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-500 font-bold gap-4">
                <p>Optimization Plan Not Found or Out of Scope</p>
                <Link href="/admin/optimization" className="text-fuchsia-400 text-sm font-normal hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    const statusBar: Record<string, string> = {
        GENERATED: 'bg-slate-500',
        UNDER_REVIEW: 'bg-yellow-500',
        ACCEPTED: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]',
        APPLIED: 'bg-indigo-500',
        REJECTED: 'bg-rose-500'
    };

    const statusBadge: Record<string, string> = {
        ACCEPTED: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700',
        APPLIED: 'bg-indigo-900/40 text-indigo-400 border border-indigo-700',
        REJECTED: 'bg-rose-900/40 text-rose-400 border border-rose-700',
        GENERATED: 'bg-slate-800 text-slate-300 border border-slate-700',
        UNDER_REVIEW: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700'
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <Link href="/admin/optimization" className="text-fuchsia-500 hover:text-fuchsia-400 font-bold text-sm flex items-center gap-2 mb-6">
                ← Return to Operation Center
            </Link>

            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Status stripe */}
                <div className="absolute top-0 left-0 w-2 h-full">
                    <div className={`w-full h-full ${statusBar[plan.status] ?? 'bg-slate-700'}`} />
                </div>

                <div className="ml-4 flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-6 mb-6">
                    <div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${statusBadge[plan.status] ?? 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                            [STATUS: {plan.status}]
                        </span>
                        <h1 className="text-3xl font-bold mt-4 text-white">{plan.title}</h1>
                        <p className="text-slate-400 mt-2 max-w-3xl">{plan.summary}</p>
                        <div className="flex gap-4 mt-3">
                            <span className="text-xs font-mono text-slate-500">SERVICE: {plan.service}</span>
                            <span className="text-xs font-mono text-slate-500">TYPE: {plan.optimizationType}</span>
                            <span className="text-xs font-mono text-slate-500">CONFIDENCE: {plan.confidence}%</span>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0 text-right shrink-0">
                        <div className="text-5xl font-extrabold text-white">{plan.score}<span className="text-xl text-fuchsia-500">/100</span></div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Impact Score</p>
                    </div>
                </div>

                <div className="ml-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Before → After */}
                    <div className="space-y-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                <History className="w-4 h-4" /> Observed Baseline
                            </h3>
                            <pre className="text-slate-300 font-mono text-sm overflow-auto max-h-64">
                                {JSON.stringify(plan.baseline, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-center">
                            <ArrowRight className="w-8 h-8 text-fuchsia-500 rotate-90 bg-slate-900 rounded-full border border-slate-700 p-1" />
                        </div>

                        <div className="bg-fuchsia-950/20 border border-fuchsia-900/50 rounded-xl p-5">
                            <h3 className="text-fuchsia-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Recommended Plan
                            </h3>
                            <pre className="text-fuchsia-100 font-mono text-sm overflow-auto max-h-64">
                                {JSON.stringify(plan.recommendedPlan, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Constraints + Actions */}
                    <div className="space-y-6">
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Physical Constraints Evaluated
                            </h3>
                            <ul className="space-y-2 mb-6">
                                {Object.entries(plan.constraints ?? {}).map(([k, v]) => (
                                    <li key={k} className="flex items-center gap-3 text-slate-400 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                        {k.replace(/([A-Z])/g, ' $1').toUpperCase()}:
                                        <span className="font-mono text-slate-300">{String(v)}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                                <Activity className="w-5 h-5 text-amber-400" /> Empirical Evidence Base
                            </h3>
                            <ul className="space-y-3">
                                {Object.entries(plan.evidence ?? {}).map(([k, v]) => (
                                    <li key={k} className="flex flex-col text-slate-400 text-sm">
                                        <span className="font-bold text-xs uppercase text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</span>
                                        <pre className="font-mono text-slate-300 mt-1 bg-slate-900 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(v, null, 2)}</pre>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Expected Impact */}
                        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                            <h3 className="text-slate-200 font-bold mb-3 text-sm uppercase tracking-wider">Expected Impact</h3>
                            {Object.entries(plan.expectedImpact ?? {}).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center border-b border-slate-800 last:border-0 py-1.5 text-sm">
                                    <span className="text-slate-400">{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                                    <span className="font-mono text-emerald-400 font-bold">{String(v)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Authorization Actions */}
                        <div className="border-t border-slate-800 pt-6 space-y-3">
                            {actionError && (
                                <div className="bg-rose-900/30 border border-rose-700/50 rounded-lg p-3 text-rose-300 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {actionError}
                                </div>
                            )}

                            {['GENERATED', 'UNDER_REVIEW'].includes(plan.status) && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={actioning}
                                        className="flex-1 bg-slate-800 hover:bg-rose-900/40 disabled:opacity-50 border border-slate-700 text-slate-300 hover:text-rose-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction('accept')}
                                        disabled={actioning}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 border border-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        {actioning ? 'Processing…' : 'Accept Directive'}
                                    </button>
                                </div>
                            )}

                            {plan.status === 'ACCEPTED' && (
                                <div className="space-y-3">
                                    <div className="bg-rose-900/20 border border-rose-900/50 rounded-xl p-4 flex gap-3 text-sm text-rose-300">
                                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                                        <p><strong>Warning:</strong> Initiating Apply will commit bounded mutations to physical domains. A physical asset record will be modified in the database.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAction('reject')}
                                            disabled={actioning}
                                            className="flex-1 bg-slate-800 hover:bg-rose-900/40 disabled:opacity-50 border border-slate-700 text-slate-300 hover:text-rose-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction('apply')}
                                            disabled={actioning}
                                            className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
                                        >
                                            <Zap className="w-4 h-4" />
                                            {actioning ? 'Applying…' : 'Apply to Domain Models'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {plan.status === 'APPLIED' && (
                                <div className="bg-indigo-900/20 border border-indigo-900/50 rounded-xl p-6 flex items-center justify-center gap-3 text-indigo-300 font-bold">
                                    <CheckCircle2 className="w-5 h-5" /> State Applied Successfully
                                </div>
                            )}

                            {plan.status === 'REJECTED' && (
                                <div className="bg-rose-900/20 border border-rose-900/50 rounded-xl p-6 flex items-center justify-center gap-3 text-rose-400 font-bold">
                                    <XCircle className="w-5 h-5" /> Recommendation Rejected
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
