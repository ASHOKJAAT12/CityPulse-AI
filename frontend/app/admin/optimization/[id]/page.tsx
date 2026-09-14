'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, ArrowRight, Zap, Target, History, Activity, GitMerge } from 'lucide-react';
import Link from 'next/link';

export default function OptimizationPlanDetail() {
    const params = useParams();
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/v1/optimization/recommendations/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setPlan(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [params.id]);

    const handleAction = async (actionType: 'accept' | 'apply') => {
        setActioning(true);
        try {
            const token = localStorage.getItem('token');
            const url = `/api/v1/optimization/recommendations/${params.id}/${actionType}`;

            const method = actionType === 'apply' && plan.status === 'ACCEPTED' ? 'POST' : 'POST';

            // Requires strong authorization bounds check handled natively on controller.
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                if (actionType === 'apply') {
                    alert('CRITICAL SUCCESS: Physical state updated through bounded planner successfully.');
                    router.push('/admin/optimization');
                } else {
                    const data = await res.json();
                    setPlan(data.data);
                }
            } else {
                const data = await res.json();
                alert(`Error: ${data.message || 'Operation failed'}`);
            }

        } catch (err) {
            console.error(err);
            alert('Failed to execute command. Check security boundaries.');
        } finally {
            setActioning(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">Evaluating Optimization Constraints...</div>;
    }

    if (!plan) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-bold">Optimization Plan Invalid or Out of Context Scope</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <Link href="/admin/optimization" className="text-fuchsia-500 hover:text-fuchsia-400 font-bold text-sm flex items-center gap-2 mb-6">
                ← Return to Operation Center
            </Link>

            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-slate-800">
                    {plan.status === 'GENERATED' && <div className="w-full h-full bg-slate-500"></div>}
                    {plan.status === 'ACCEPTED' && <div className="w-full h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]"></div>}
                    {plan.status === 'APPLIED' && <div className="w-full h-full bg-indigo-500"></div>}
                </div>

                <div className="ml-4 flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-6 mb-6">
                    <div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${plan.status === 'ACCEPTED' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700' :
                            plan.status === 'APPLIED' ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-700' :
                                'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                            [STATUS: {plan.status}]
                        </span>
                        <h1 className="text-3xl font-bold mt-4 text-white">{plan.title}</h1>
                        <p className="text-slate-400 mt-2 max-w-3xl">{plan.summary}</p>
                    </div>

                    <div className="mt-4 md:mt-0 text-right">
                        <div className="text-4xl font-extrabold text-white">{plan.score}<span className="text-xl text-fuchsia-500">/100</span></div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Impact Confidence</p>
                    </div>
                </div>

                <div className="ml-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Visual Before/After Flow */}
                    <div className="space-y-6">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><History className="w-4 h-4" /> Observed Baseline</h3>
                            <pre className="text-slate-300 font-mono text-sm overflow-auto">
                                {JSON.stringify(plan.baseline, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10"><ArrowRight className="w-8 h-8 text-fuchsia-500 rotate-90 lg:rotate-0 bg-slate-900 rounded-full border border-slate-700 p-1" /></div>

                        <div className="bg-fuchsia-950/20 border border-fuchsia-900/50 rounded-xl p-5 shadow-[inset_0_0_30px_rgba(217,70,239,0.05)]">
                            <h3 className="text-fuchsia-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Bounded Plan Recommendation</h3>
                            <pre className="text-fuchsia-100 font-mono text-sm overflow-auto">
                                {JSON.stringify(plan.recommendedPlan, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Constraints and Execution Engine */}
                    <div>
                        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Physical Constraints Evaluated</h3>
                            <ul className="space-y-3 mb-6">
                                {Object.keys(plan.constraints || {}).map(c => (
                                    <li key={c} className="flex items-center gap-3 text-slate-400 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> {c.replace(/([A-Z])/g, ' $1').toUpperCase()}: <span className="font-mono text-slate-300">{plan.constraints[c]?.toString()}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-2"><Activity className="w-5 h-5 text-amber-400" /> Empirical Evidence Base</h3>
                            <ul className="space-y-3">
                                {Object.keys(plan.evidence || {}).map(e => (
                                    <li key={e} className="flex flex-col text-slate-400 text-sm">
                                        <span className="font-bold text-xs uppercase text-slate-500">{e.replace(/([A-Z])/g, ' $1')}</span>
                                        <pre className="font-mono text-slate-300 mt-1 bg-slate-900 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(plan.evidence[e], null, 2)}</pre>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Authorization Actions */}
                        <div className="mt-8 border-t border-slate-800 pt-6">
                            {plan.status === 'GENERATED' && (
                                <button
                                    onClick={() => handleAction('accept')} disabled={actioning}
                                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                                    Acknowledge & Accept Directive Into Review
                                </button>
                            )}

                            {plan.status === 'ACCEPTED' && (
                                <div className="space-y-4">
                                    <div className="bg-rose-900/20 border border-rose-900/50 rounded-xl p-4 flex gap-3 text-sm text-rose-300">
                                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                        <p><strong>Warning:</strong> Initiating Apply will commit bounded mutations to physical domains. A physical asset or entity record will be modified.</p>
                                    </div>
                                    <button
                                        onClick={() => handleAction('apply')} disabled={actioning}
                                        className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all">
                                        <Zap className="w-5 h-5" /> APPLY PLAN TO DOMAIN MODELS
                                    </button>
                                </div>
                            )}

                            {plan.status === 'APPLIED' && (
                                <div className="bg-indigo-900/20 border justify-center border-indigo-900/50 rounded-xl p-6 flex gap-3 text-center text-indigo-300 font-bold">
                                    STATE APPLIED SUCCESSFULLY
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldCheckIcon() { return <ShieldCheck className="w-4 h-4" /> }
function GitMergeIcon() { return <GitMerge className="w-4 h-4" /> }
