'use client';

import { useState } from 'react';
import { GitMerge, BrainCircuit, Activity, RotateCcw, Play, Settings2, ShieldCheck } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export default function ScenarioBuilder() {
    const [name, setName] = useState('Weekend Surge Simulation');
    const [scenarioType, setScenarioType] = useState('TRAFFIC_SURGE');
    const [impact, setImpact] = useState(30);
    const [offlineVehicles, setOfflineVehicles] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Scenario result is the full scenario document returned from the server
    const [result, setResult] = useState<any>(null);

    const buildInputs = () => {
        if (scenarioType === 'TRAFFIC_SURGE') return { increasePercentage: impact, impactFactor: impact };
        if (scenarioType === 'GARBAGE_VEHICLE_SHORTAGE') return { offlineVehicles, impactFactor: impact };
        return { impactFactor: impact };
    };

    const handleRunSimulation = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) { setError('Not authenticated.'); return; }

            // Step 1: Create scenario
            const createRes = await fetch(`${API_BASE}/api/v1/optimization/scenarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name, scenarioType, inputs: buildInputs() })
            });

            const createData = await createRes.json();
            if (!createRes.ok) { setError(createData.message || 'Scenario creation failed'); return; }

            const scenarioId = createData.data._id as string;

            // Step 2: Run the simulation
            const runRes = await fetch(`${API_BASE}/api/v1/optimization/scenarios/${scenarioId}/run`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const runData = await runRes.json();
            if (!runRes.ok) { setError(runData.message || 'Simulation run failed'); return; }

            // Server returns the full scenario document in runData.data
            setResult(runData.data);

        } catch (err) {
            console.error('Simulation error:', err);
            setError('Network error or server unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2">
                <BrainCircuit className="w-8 h-8 text-fuchsia-500" /> Dynamic Scenario Simulator
            </h1>
            <p className="text-slate-400 mb-8 border-b border-slate-800 pb-6">
                Model what-if physical impacts without risking live infrastructure.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Console */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-slate-400" /> Simulation Parameters
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2">Simulation Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2">Scenario Type</label>
                            <select
                                value={scenarioType}
                                onChange={e => setScenarioType(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors"
                            >
                                <option value="TRAFFIC_SURGE">Traffic / Arterial Flow Surge</option>
                                <option value="GARBAGE_VEHICLE_SHORTAGE">Garbage Logistics Shortage</option>
                                <option value="CUSTOM">General Resource Constraint</option>
                            </select>
                        </div>

                        {scenarioType === 'GARBAGE_VEHICLE_SHORTAGE' && (
                            <div>
                                <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2 flex justify-between">
                                    Offline Vehicles <span>{offlineVehicles}</span>
                                </label>
                                <input
                                    type="range" min="1" max="10" step="1"
                                    value={offlineVehicles}
                                    onChange={e => setOfflineVehicles(parseInt(e.target.value))}
                                    className="w-full accent-fuchsia-500"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block tracking-wider uppercase text-xs font-bold text-slate-500 mb-2 flex justify-between">
                                Impact Multiplier <span>+{impact}%</span>
                            </label>
                            <input
                                type="range" min="5" max="100" step="5"
                                value={impact}
                                onChange={e => setImpact(parseInt(e.target.value))}
                                className="w-full accent-fuchsia-500"
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-900/30 border border-rose-700/50 rounded-lg p-3 text-rose-300 text-sm">{error}</div>
                        )}

                        <button
                            onClick={handleRunSimulation}
                            disabled={loading}
                            className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {loading ? 'Evaluating Model…' : 'Execute What-If Hypothesis'}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Activity className="text-emerald-400 w-5 h-5" /> Bounded Impact Assessment
                    </h2>

                    {!result ? (
                        <div className="flex items-center justify-center h-64 border border-slate-800 border-dashed rounded-xl bg-slate-950/50">
                            <p className="text-slate-600 font-medium">Awaiting Simulation Parameters…</p>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-in fade-in zoom-in duration-300">
                            {/* Scenario metadata */}
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 rounded-full text-xs font-bold uppercase">{result.status}</span>
                                <span className="text-slate-500 text-xs font-mono">{result.scenarioType}</span>
                            </div>

                            <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-xl p-5">
                                <h4 className="text-emerald-400 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Baseline Capacity Output
                                </h4>
                                <pre className="text-slate-300 font-mono text-sm bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-auto">
                                    {JSON.stringify(result.result?.baseline ?? {}, null, 2)}
                                </pre>
                            </div>

                            <div className="bg-fuchsia-900/20 border border-fuchsia-900/50 rounded-xl p-5">
                                <h4 className="text-fuchsia-400 font-bold mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
                                    <GitMerge className="w-4 h-4" /> Simulated Degradation Profile
                                </h4>
                                <pre className="text-fuchsia-200 font-mono text-sm bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-auto">
                                    {JSON.stringify(result.result?.simulation ?? {}, null, 2)}
                                </pre>
                            </div>

                            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-inner">
                                <h4 className="text-slate-500 font-bold mb-2 uppercase tracking-wider text-xs">Impact Assessment</h4>
                                <pre className="text-slate-200 font-mono text-sm">
                                    {JSON.stringify(result.result?.impact ?? {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
