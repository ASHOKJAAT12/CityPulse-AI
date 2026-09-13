'use client';

import { useEffect, useState } from 'react';
import { BatteryCharging, Plug, Zap, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { evService } from '../../../services/ev.service';
import { useAuth } from '../../../hooks/useAuth';

export default function EVDashboard() {
    const { user } = useAuth();
    const cityId = user?.cityId;

    const [stats, setStats] = useState({
        totalStations: 0,
        availableStations: 0,
        maintenanceStations: 0,
        totalConnectors: 0,
        availableConnectors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            if (!cityId) return;
            try {
                const res = await evService.getStations(cityId);
                const stations = res.data?.data || [];

                let totalConnectors = 0;
                let availableConnectors = 0;

                stations.forEach((s: any) => {
                    totalConnectors += s.totalConnectors || 0;
                    availableConnectors += s.availableConnectors || 0;
                });

                if (mounted) {
                    setStats({
                        totalStations: stations.length,
                        availableStations: stations.filter((s: any) => s.status === 'OPERATIONAL').length,
                        maintenanceStations: stations.filter((s: any) => s.status === 'MAINTENANCE').length,
                        totalConnectors,
                        availableConnectors
                    });
                }
            } catch (error) {
                console.error("Failed to load EV stats", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchStats();
        return () => { mounted = false };
    }, [cityId]);

    return (
        <div className="space-y-8 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
                        <BatteryCharging className="w-8 h-8 mr-3 text-emerald-500" /> EV Infrastructure
                    </h1>
                    <p className="text-slate-500 mt-2">Manage citywide charging stations, connector availability, and charging sessions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
                        <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total Stations</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.totalStations}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Operational</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.availableStations}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
                        <Plug className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total Connectors</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.totalConnectors}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mb-3">
                        <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Available Ports</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.availableConnectors}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mb-3">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Maintenance</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.maintenanceStations}</p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/ev/stations" className="group rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all flex flex-col p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <BatteryCharging className="w-6 h-6 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-slate-800 transition-colors">Stations & Plugs</h4>
                    </div>
                    <p className="text-slate-500 text-sm">Register, edit capacity, change status, and view the city charging network.</p>
                </Link>
                <div className="group rounded-2xl bg-slate-50 border border-slate-200 opacity-60 flex flex-col p-6 cursor-not-allowed">
                    <div className="flex items-center space-x-3 mb-4">
                        <FileText className="w-6 h-6 text-slate-500 transition-colors" />
                        <h4 className="font-bold text-lg text-slate-900 transition-colors">Charging Sessions</h4>
                    </div>
                    <p className="text-slate-500 text-sm">Track active vehicles charging and view history logs. (Coming soon module)</p>
                </div>
                <div className="group rounded-2xl bg-slate-50 border border-slate-200 opacity-60 flex flex-col p-6 cursor-not-allowed">
                    <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-slate-500 transition-colors" />
                        <h4 className="font-bold text-lg text-slate-900 transition-colors">Incidents</h4>
                    </div>
                    <p className="text-slate-500 text-sm">View overheating faults, communication breakdowns, and hardware events.</p>
                </div>
            </div>
        </div>
    )
}
