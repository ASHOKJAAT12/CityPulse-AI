'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Droplet, List, Settings, AlertTriangle, Calendar, Activity, Bell, X } from 'lucide-react';
import Link from 'next/link';
import api from '../../../services/api';

export default function WaterAdminDashboard() {
    const { user } = useAuth();

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [submittingAlert, setSubmittingAlert] = useState(false);
    const [alertData, setAlertData] = useState({
        title: '',
        message: '',
        priority: 'HIGH'
    });

    if (!user) return null;

    const handleSendAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmittingAlert(true);
            await api.post('/admin/notifications/announcements', {
                title: alertData.title,
                message: alertData.message,
                category: 'SERVICE_ALERT',
                priority: alertData.priority,
            });
            setShowAlertModal(false);
            setAlertData({ title: '', message: '', priority: 'HIGH' });
            alert('Public alert broadcasted to citizens successfully!');
        } catch (error) {
            console.error('Failed to send alert', error);
            alert('Failed to send public alert');
        } finally {
            setSubmittingAlert(false);
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Water Management & Monitoring</h1>
                    <p className="text-slate-500 mt-2">Manage water assets, monitor live sensors, and respond to incidents.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/water/assets" className="group block">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                    <List className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Water Assets</h3>
                                <p className="text-slate-500 text-sm mt-2">Manage infrastructure like tanks, reservoirs, and pumps.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/water/sensors" className="group block">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-200 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                    <Activity className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Sensors & Analytics</h3>
                                <p className="text-slate-500 text-sm mt-2">Configure sensors, viewing real-time readouts, and thresholds.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/water/incidents" className="group block">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-red-200 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Incidents</h3>
                                <p className="text-slate-500 text-sm mt-2">Respond to threshold violations, warnings, and asset failures.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/water/schedules" className="group block">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-emerald-200 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                    <Calendar className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Supply Schedules</h3>
                                <p className="text-slate-500 text-sm mt-2">Configure public water provisioning times per zone.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/city/water" target="_blank" className="group block">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-cyan-200 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                                    <Droplet className="w-6 h-6 text-cyan-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Citizen View</h3>
                                <p className="text-slate-500 text-sm mt-2">Open the public-facing dashboard in a new tab.</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white mt-8 shadow-lg">
                    <div className="flex items-center gap-3">
                        <Droplet className="text-blue-400 w-8 h-8" />
                        <h2 className="text-2xl font-bold">Live Monitoring Active</h2>
                    </div>
                    <p className="text-slate-400 mt-2">
                        WebSocket feeds are currently active. Threshold violations will automatically be escalated to Incidents.
                    </p>
                </div>

                <div className="mt-8 border-t border-slate-800 pt-6">
                    <h3 className="text-lg font-bold mb-2">Emergency Broadcasts</h3>
                    <p className="text-slate-400 text-sm mb-4">Manually notify citizens in your region of critical water supply issues or contamination risks.</p>
                    <button
                        onClick={() => setShowAlertModal(true)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Bell className="w-5 h-5" />
                        Broadcast Public Alert
                    </button>
                </div>
            </div>

            {/* Alert Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-red-100 flex justify-between items-center bg-red-50">
                            <div className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="w-5 h-5" />
                                <h2 className="text-xl font-bold">New Public Alert</h2>
                            </div>
                            <button onClick={() => setShowAlertModal(false)} className="text-red-400 hover:text-red-700 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-5">
                            <form id="alert-form" onSubmit={handleSendAlert} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Alert Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={alertData.title}
                                        onChange={e => setAlertData({ ...alertData, title: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="e.g. Major Pipe Burst in Sector 4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={alertData.priority}
                                        onChange={e => setAlertData({ ...alertData, priority: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="MEDIUM">Medium (Advisory)</option>
                                        <option value="HIGH">High (Warning)</option>
                                        <option value="CRITICAL">Critical (Emergency)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Public Message</label>
                                    <textarea
                                        required
                                        value={alertData.message}
                                        onChange={e => setAlertData({ ...alertData, message: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-24"
                                        placeholder="Water supply will be suspended for 4 hours..."
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAlertModal(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="alert-form"
                                disabled={submittingAlert}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {submittingAlert ? 'Broadcasting...' : 'Send Alert Immediately'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
