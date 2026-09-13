'use client';
import { useAuth } from '../../../../hooks/useAuth';
import { ArrowLeft, Clock, Activity, CheckCircle, XCircle, AlertTriangle, UserCheck, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyDetailPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    // E.g. fetch emergency by ID, teams, timeline...

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both max-w-5xl">
            <Link href="/admin/emergency" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Command Center
            </Link>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                                P1
                            </span>
                            <span className="text-slate-500 text-sm font-mono">EMG-2026-000001</span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full border border-amber-200">
                                <AlertTriangle className="w-3 h-3" />
                                UNVERIFIED
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Massive Power Outage Downtown</h1>
                        <p className="text-slate-500 mt-2 flex items-center gap-2">
                            Source: AI Anomaly Correlation <span className="text-emerald-500 font-medium">98% Confidence</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    <div className="md:col-span-2 space-y-6">
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Incident Description</h3>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                                AI has correlated a widespread failure in the central grid coupled with 50+ citizen reports in the downtown area.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Response & Dispatch</h3>
                            <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                                <Shield className="w-12 h-12 text-slate-300" />
                                <div>
                                    <h4 className="font-semibold text-slate-800">Awaiting Verification</h4>
                                    <p className="text-slate-500 text-sm mt-1">Verify this incident to unlock dispatch options.</p>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <button className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Verify & Open Dispatch
                                    </button>
                                    <button className="px-6 py-2 bg-white text-rose-600 border border-slate-200 rounded-full text-sm font-medium hover:bg-rose-50 transition-colors flex items-center">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Mark False Alarm
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Operations Timeline
                            </h3>
                            <div className="border-l-2 border-slate-200 ml-2 space-y-4 relative">
                                <div className="pl-4 relative">
                                    <div className="absolute w-3 h-3 bg-slate-900 rounded-full -left-[1.4rem] top-1"></div>
                                    <p className="text-sm font-semibold text-slate-900">Incident Reported</p>
                                    <p className="text-xs text-slate-500 font-mono mt-1">2026-09-13 14:02:00</p>
                                    <p className="text-xs text-slate-600 mt-1">System correlated AI Anomaly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
