'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Zap, CircuitBoard, BatteryMedium, Cpu, CheckCircle2, RotateCw } from 'lucide-react';

export default function IoTDeviceInventory() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch('/api/v1/iot/devices', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDevices(data.data.devices);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();

        // Realtime sync is pushed through global App Layout hook
        // Re-renders handle state seamlessly.
        // The hook is usually wrapped automatically, ignoring explicit binds for compile safely.
        // The hook is usually wrapped automatically, ignoring explicit binds for compile safely.
        return () => {
        }
    }, []);

    const generateToken = async (deviceId: string) => {
        if (!confirm('This will invalidate all current edge tokens for this device instantly. Proceed?')) return;

        try {
            const response = await fetch(`/api/v1/iot/devices/${deviceId}/credentials`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (response.ok) {
                alert(`API KEY GENERATED (STORE IT SECURELY NOW):\n\n${data.data.apiKey}\n\nIt cannot be shown again.`);
                // Force refresh
                window.location.reload();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2">
                <CircuitBoard className="w-8 h-8 text-indigo-400" /> Edge Fleet Inventory
            </h1>
            <p className="text-slate-400 mb-8 border-b border-slate-800 pb-6">Secure physical hardware registry and API Key generation management.</p>

            {loading ? (
                <div className="animate-pulse text-indigo-500/50 flex items-center gap-3"><RotateCw className="animate-spin w-5 h-5" /> Compiling hardware signatures...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
                    {devices.map(device => (
                        <div key={device._id} className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors mb-4 lg:mb-0">
                            {/* Device Connection Status Pulse */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800">
                                {device.connectionStatus === 'ONLINE' && <div className="h-full w-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]"></div>}
                                {device.connectionStatus === 'OFFLINE' && <div className="h-full w-full bg-rose-500"></div>}
                                {device.connectionStatus === 'STALE' && <div className="h-full w-full bg-yellow-500"></div>}
                            </div>

                            <div className="pl-4 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-100">{device.deviceName}</h3>
                                    <p className="text-slate-500 font-mono text-sm mt-1">{device.deviceId} {'//'} <span className="text-slate-400">{device.deviceType}</span></p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest ${device.status === 'ACTIVE' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {device.status}
                                    </span>
                                </div>
                            </div>

                            <div className="pl-4 mt-6 grid grid-cols-2 gap-4 text-sm bg-slate-950 rounded-xl p-4 border border-slate-800">
                                <div>
                                    <div className="text-slate-500 mb-1">State</div>
                                    <div className="font-semibold text-slate-300 flex items-center gap-2">
                                        {device.connectionStatus}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-1">Last Transmission</div>
                                    <div className="font-mono text-slate-400">
                                        {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="pl-4 mt-6 pt-6 border-t border-slate-800 flex justify-end gap-3">
                                <button className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">Configure Route</button>
                                <button
                                    onClick={() => generateToken(device._id)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> Revoke & Reissue AES Token
                                </button>
                            </div>
                        </div>
                    ))}
                    {devices.length === 0 && (
                        <div className="col-span-1 lg:col-span-2 text-center py-20 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl">
                            <Cpu className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-500">No Hardware Bound</h3>
                            <p className="text-slate-600">Register devices via API and they will emerge here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
