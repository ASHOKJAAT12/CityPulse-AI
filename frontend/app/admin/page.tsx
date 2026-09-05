'use client';
import { useAuth } from '../../hooks/useAuth';
import { Activity, ShieldCheck, Database, Server, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user.firstName}</h1>
                <p className="text-slate-500 mt-2">Here is the current operational status for your deployment zone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Clearance Level</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{user.role}</p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">System Status</h3>
                    <div className="flex items-center mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div>
                        <p className="text-2xl font-bold text-slate-900">Online</p>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Database Node</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">Connected</p>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                        <Server className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Active Zone</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{user.cityId ? 'City Limited' : 'Global'}</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden mt-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none hidden md:block">
                    <Shield className="w-64 h-64" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Security Policy Active</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        You are currently authenticated as <strong className="text-white">{user.role}</strong>.
                        Your session is strictly protected by JWT rotations and is strictly bound to authorized capabilities.
                        {user.role === 'CITY_ADMIN' ? ' You are mapped safely within your local City Zone.' : ' As a Super Admin, you retain platform-wide write access.'}
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></div>
                        Zero Trust Architecture Enabled
                    </div>
                </div>
            </div>
        </div>
    );
}
