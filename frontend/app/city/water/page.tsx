'use client';
import { useState, useEffect } from 'react';
import { Droplet, Calendar, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';

export default function CitizenWaterPage() {
    const { user } = useAuth();
    const cityId = user?.cityId || 'default'; // Should get from context/URL ideally

    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    useEffect(() => {
        api.get('/city/water/schedules') // Should use a public route, or if AuthGuard allows
            .then((res: any) => setSchedules(res.data.data))
            .catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const todaysSchedules = schedules.filter(s => s.dayOfWeek === today);
    const upcomingSchedules = schedules.filter(s => s.dayOfWeek !== today);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both pb-12">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Droplet className="w-48 h-48" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-sm">
                        Public Infrastructure
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">City Water Network</h1>
                    <p className="text-blue-50 text-lg">
                        Stay informed about your area&apos;s water supply schedules and operational status. Data is securely isolated to your city.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-500" /> Today&apos;s Supply
                    </h2>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500 border border-slate-100 rounded-2xl">Loading schedule data...</div>
                    ) : todaysSchedules.length > 0 ? (
                        <div className="space-y-4">
                            {todaysSchedules.map(schedule => (
                                <div key={schedule._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{schedule.areaName}</h3>
                                        <p className="text-slate-500 text-sm mt-1">{schedule.notes}</p>
                                    </div>
                                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-center md:text-right border border-blue-100">
                                        <p className="text-xs font-bold uppercase tracking-wide opacity-80 mb-0.5">Scheduled</p>
                                        <p className="font-mono font-bold text-lg">{schedule.startTime}</p>
                                        <p className="text-[10px] uppercase font-bold text-blue-500">to {schedule.endTime}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
                            No water supply scheduled for your area today.
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 pt-4">
                        <ArrowRight className="w-6 h-6 text-slate-400" /> Upcoming Schedules
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!loading && upcomingSchedules.map(schedule => (
                            <div key={schedule._id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{dayNames[schedule.dayOfWeek]}</span>
                                <h4 className="font-bold text-slate-800 text-sm mt-1">{schedule.areaName}</h4>
                                <p className="text-blue-600 font-mono text-sm font-bold mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
                                    {schedule.startTime} - {schedule.endTime}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                        <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Service Status</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            The intelligent monitoring system shows your city&apos;s water infrastructure is currently functioning within normal parameters.
                        </p>
                        <Link href="/city/map">
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition-colors border border-white/5 text-sm">
                                View City Map
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <AlertTriangle className="w-24 h-24 text-red-500" />
                        </div>
                        <h3 className="font-bold text-red-700 text-lg mb-2">Public Alerts</h3>
                        <p className="text-sm text-slate-600">
                            There are currently no major disruptions or active maintenance alerts requiring public action in your zone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
