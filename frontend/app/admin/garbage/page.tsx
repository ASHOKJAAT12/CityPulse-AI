'use client';
import { useEffect, useState } from 'react';
import { Truck, Map, Users, AlertCircle, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { garbageService } from '../../../services/garbage.service';

export default function GarbageDashboard() {
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeRoutes: 0,
        totalDrivers: 0,
        draftRoutes: 0,
        maintenanceVehicles: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            try {
                // To display counts, fetch them from backend
                // In production, there would be an aggregated stats endpoint.
                // Fetching lists concurrently to compute counts for Phase 4.
                const [vehiclesRes, driversRes, routesRes] = await Promise.all([
                    garbageService.getVehicles(),
                    garbageService.getDrivers(),
                    garbageService.getRoutes()
                ]);

                if (mounted) {
                    setStats({
                        totalVehicles: vehiclesRes.data?.length || 0,
                        activeRoutes: routesRes.data?.filter(r => r.status === 'ACTIVE').length || 0,
                        totalDrivers: driversRes.data?.length || 0,
                        draftRoutes: routesRes.data?.filter(r => r.status === 'DRAFT').length || 0,
                        maintenanceVehicles: vehiclesRes.data?.filter(v => v.status === 'MAINTENANCE').length || 0,
                    });
                }
            } catch (error) {
                console.error("Failed to load garbage stats", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchStats();
        return () => { mounted = false };
    }, []);

    return (
        <div className="space-y-8 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Garbage Management</h1>
                    <p className="text-slate-500 mt-2">Manage your city's garbage operational fleet and routes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
                        <Truck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total Vehicles</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.totalVehicles}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-3">
                        <Map className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Active Routes</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.activeRoutes}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total Drivers</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.totalDrivers}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mb-3">
                        <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Draft Routes</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.draftRoutes}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mb-3">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Maintenance</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : stats.maintenanceVehicles}</p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/garbage/vehicles" className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Truck className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" />
                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-slate-800 transition-colors">Manage Vehicles</h4>
                        </div>
                        <p className="text-slate-500 text-sm">Register, edit capacity, change status, and view the fleet.</p>
                    </div>
                </Link>
                <Link href="/admin/garbage/drivers" className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Users className="w-6 h-6 text-slate-500 group-hover:text-indigo-500 transition-colors" />
                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-slate-800 transition-colors">Manage Drivers</h4>
                        </div>
                        <p className="text-slate-500 text-sm">Onboard drivers, set active/leave status, update contact info.</p>
                    </div>
                </Link>
                <Link href="/admin/garbage/routes" className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Map className="w-6 h-6 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-slate-800 transition-colors">Manage Routes</h4>
                        </div>
                        <p className="text-slate-500 text-sm">Create schedules, assign drivers, draw on map, design operational areas.</p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
