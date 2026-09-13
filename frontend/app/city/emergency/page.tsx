'use client';
import { useAuth } from '../../../hooks/useAuth';
import { AlertCircle, MapPin, Activity, Navigation, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CitizenEmergencyView() {
    const { user } = useAuth(); // Citizen
    // For citizen view, we might fetch only `publicVisibility = true` emergencies
    const [publicEmergencies] = useState([
        {
            id: '1',
            number: 'EMG-2026-000001',
            title: 'Water Main Break Near Commercial St',
            severity: 'HIGH',
            status: 'RESPONSE_IN_PROGRESS',
            updated: '5 minutes ago',
            instruction: 'Please avoid Commercial St and expect lower water pressure in the area.',
        }
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both max-w-4xl mx-auto">
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 border border-rose-100">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-rose-900">City Emergency Alerts</h1>
                    <p className="text-rose-700 mt-1">Live updates on public safety and high-impact infrastructure events in your city.</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    {publicEmergencies.length} Active Public Alerts
                </h2>

                {publicEmergencies.map((emg) => (
                    <div key={emg.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                        <div className="pl-4">
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <div>
                                    <div className="flex gap-2 items-center mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">HIGH PRIORITY</span>
                                        <span className="text-slate-400 text-sm font-mono">{emg.number}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{emg.title}</h3>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="block text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{emg.status.replace(/_/g, ' ')}</span>
                                </div>
                            </div>

                            <div className="mt-4 bg-slate-50 rounded-xl p-4 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-slate-900 text-sm">Public Safety Advisory</h4>
                                    <p className="text-slate-600 text-sm mt-1">{emg.instruction}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1"><Navigation className="w-4 h-4" /> Last update: {emg.updated}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {publicEmergencies.length === 0 && (
                    <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Clear Skies</h3>
                        <p className="text-slate-500 mt-1">There are no active public safety broadcasts for your city right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
