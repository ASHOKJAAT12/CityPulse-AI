'use client';
import { useAuth } from '../../../hooks/useAuth';
import { Activity, AlertCircle, RefreshCcw, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
// We will use recharts for simple time series. Since recharts does not have typing strictness issues generally, we can directly import.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const currentCityId = user?.cityId || 'unknown-city';
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<any>(null);
    const [trends, setTrends] = useState<any>(null);
    const [emergency, setEmergency] = useState<any>(null);

    useEffect(() => {
        if (currentCityId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentCityId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const resDash = await api.get(`/analytics/dashboard?cityId=${currentCityId}`);
            setDashboard(resDash.data.data);
            const resTrend = await api.get(`/analytics/trends?cityId=${currentCityId}`);
            setTrends(resTrend.data.data);
            const resEmerg = await api.get(`/analytics/emergency?cityId=${currentCityId}`);
            setEmergency(resEmerg.data.data);
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const res = await api.post(`/analytics/export`, { cityId: currentCityId, format, metrics: ['all'] }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `city_analytics_export.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    const TrendIcon = ({ trend }: { trend?: string }) => {
        if (trend === 'WORSENING') return <TrendingUp className="w-5 h-5 text-red-500" />;
        if (trend === 'IMPROVING') return <TrendingDown className="w-5 h-5 text-emerald-500" />;
        return <Minus className="w-5 h-5 text-slate-400" />;
    };

    if (loading || !dashboard) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <RefreshCcw className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-500" /> City Intelligence
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Executive dashboard and real-time operational insights.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => fetchData()} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                        <RefreshCcw className="w-4 h-4" /> Refresh
                    </button>
                    <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">City Health Score</h2>
                    <div className="mt-4 flex items-end justify-between">
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
                            {dashboard.overallHealth} / 100
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:border-red-500/50 transition-colors cursor-pointer" onClick={() => window.location.href = '/admin/emergency'}>
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Emergencies</h2>
                    <div className="mt-4 flex items-end justify-between">
                        <div className="text-4xl font-bold text-red-600 dark:text-red-500">{emergency?.unresolvedCount ?? 0}</div>
                        <AlertCircle className="w-8 h-8 text-red-500/20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:border-indigo-500/50" onClick={() => window.location.href = '/admin/reports'}>
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Citizen Reports</h2>
                    <div className="mt-4 flex items-end justify-between">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{dashboard.openCitizenReports}</div>
                        <TrendIcon trend={trends?.citizenReports?.trend} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Incidents</h2>
                    <div className="mt-4 flex items-end justify-between">
                        <div className="text-4xl font-bold text-amber-500">{dashboard.activeIncidents}</div>
                        <TrendIcon trend={trends?.trafficIncidents?.trend} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Incident & Report Volume (Last 7 Days)</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trends?.timeSeries || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="incidents" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Service Incidents" />
                                    <Line type="monotone" dataKey="reports" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Citizen Reports" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Service Comparison</h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Water', active: dashboard?.activeIncidents || 2, max: 10 },
                                    { name: 'Electricity', active: dashboard?.activeIncidents || 4, max: 10 },
                                    { name: 'Traffic', active: 3, max: 10 },
                                    { name: 'EV', active: 1, max: 10 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                                    <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Active Issues" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: Mini Reports */}
                <div className="space-y-8">
                    {/* Trend Summary */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">7-Day Trajectory</h2>

                        <div className="space-y-6 mt-4">
                            <div>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Emergencies</span>
                                    <span className={`font-bold ${trends?.emergencies?.trend === 'WORSENING' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {trends?.emergencies?.change > 0 ? '+' : ''}{trends?.emergencies?.change}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${trends?.emergencies?.trend === 'WORSENING' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: '50%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Citizen Reports</span>
                                    <span className={`font-bold ${trends?.citizenReports?.trend === 'WORSENING' ? 'text-amber-500' : 'text-indigo-500'}`}>
                                        {trends?.citizenReports?.change > 0 ? '+' : ''}{trends?.citizenReports?.change}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Limits */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Logistics</h2>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Total Critical Emergencies</span>
                                <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded w-12 text-center">{emergency?.criticalCount ?? 0}</span>
                            </li>
                            <li className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Delayed Garbage Routes</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded w-12 text-center">{dashboard.garbageRoutesDelayed}</span>
                            </li>
                            <li className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Total Emergencies</span>
                                <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded w-12 text-center">{emergency?.totalEmergencies ?? 0}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
