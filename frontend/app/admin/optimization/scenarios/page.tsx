'use client';

import { useState } from 'react';
import { GitMerge, BrainCircuit, Activity, RotateCcw, Save, Play, Settings2, ShieldCheck } from 'lucide-react';

export default function ScenarioBuilder() {
    const [name, setName] = useState('Weekend Surge Simulation');
    const [scenarioType, setScenarioType] = useState('TRAFFIC_SURGE');
    const [impact, setImpact] = useState(30);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleRunSimulation = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // 1. Create bounded Scenario object safely
            const createRes = await fetch('/api/v1/optimization/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name,
                    scenarioType,
                    inputs: { increasePercentage: impact, impactFactor: impact }
                })
            });

            if (!createRes.ok) throw new Error('Create failed');
            const data = await createRes.json();
            const scenarioId = data.data._id;

            // 2. Execute Bounded Run
            const runRes = await fetch(`/api/v1/optimization/scenarios/${scenarioId}/run`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!runRes.ok) throw new Error('Run failed');
            const runData = await runRes.json();

            setResult(runData.data);

        } catch (error) {
            console.error(error);
            alert('Simulation bounds exceeded or failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2">
                <BrainCircuit className="w-8 h-8 text-fuchsia-500" /> Dynamic Scenario Simulator
            </h1>
            <p className="text-slate-400 mb-8 border-b border-slate-800 pb-6">Model what-if physical impacts without risking live infrastructure.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Console */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><SettingsIcon /> Simulation Parameters</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2">Simulation Header</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-fuchsia-500"
                            />
                        </div>

                        <div>
                            <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2">Bounded Vector Range</label>
                            <select
                                value={scenarioType}
                                onChange={e => setScenarioType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-fuchsia-500"
                            >
                                <option value="TRAFFIC_SURGE">Traffic / Arterial Flow Surge</option>
                                <option value="GARBAGE_VEHICLE_SHORTAGE">Garbage Logistics Shortage</option>
                                <option value="GRID_DEPLETION">Electrical Grid Constraint</option>
                            </select>
                        </div>

                        <div>
                            <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2 flex justify-between">
                                Impact Multiplier <span>+{impact}%</span>
                            </label>
                            <input
                                type="range"
                                min="5" max="100" step="5"
                                value={impact}
                                onChange={e => setImpact(parseInt(e.target.value))}
                                className="w-full accent-fuchsia-500"
                            />
                        </div>

                        <button
                            onClick={handleRunSimulation}
                            disabled={loading}
                            className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                            {loading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {loading ? 'Evaluating Model...' : 'Execute What-If Hypothesis'}
                        </button>
                    </div>
                </div>

                {/* Validation and Output Ledger */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Activity className="text-emerald-400" /> Bounded Impact Assessment</h2>

                    {!result ? (
                        <div className="flex items-center justify-center h-64 border border-slate-800 border-dashed rounded-xl bg-slate-950/50">
                            <p className="text-slate-600 font-medium">Awaiting Simulation Parameters...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-xl p-6">
                                <h4 className="text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                                    <ShieldCheckIcon /> Baseline Capacity Output
                                </h4>
                                <pre className="text-slate-300 font-mono text-sm bg-slate-950 p-4 rounded-lg border border-slate-800">
                                    {JSON.stringify(result.result?.baseline, null, 2)}
                                </pre>
                            </div>

                            <div className="bg-fuchsia-900/20 border border-fuchsia-900/50 rounded-xl p-6 relative">
                                <h4 className="text-fuchsia-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                                    <GitMergeIcon /> Simulated Degradation Profile
                                </h4>
                                <pre className="text-fuchsia-200 font-mono text-sm bg-slate-950 p-4 rounded-lg border border-slate-800">
                                    {JSON.stringify(result.result?.simulation, null, 2)}
                                </pre>
                            </div>

                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                                <h4 className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-sm">Automated Impact Summary</h4>
                                <p className="text-lg text-slate-200">
                                    The theoretical simulation predicts a cascading risk observation of: <strong className="text-indigo-400">{JSON.stringify(result.result?.impact)}</strong>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsIcon() { return <Settings2 className="w-5 h-5 text-slate-400" /> }
function ShieldCheckIcon() { return <ShieldCheck className="w-4 h-4" /> }
function GitMergeIcon() { return <GitMerge className="w-4 h-4" /> }
