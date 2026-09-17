'use client';
import { useAuth } from '../../hooks/useAuth';
import { Activity, ShieldCheck, Database, Server, ShieldAlert } from 'lucide-react';

const statCards = [
    {
        icon: ShieldCheck,
        iconBg: 'rgba(34,197,94,0.1)',
        iconColor: '#16a34a',
        label: 'Clearance Level',
        getValue: (user: any) => user.role,
    },
    {
        icon: Activity,
        iconBg: 'rgba(79,107,237,0.1)',
        iconColor: '#4F6BED',
        label: 'System Status',
        getValue: () => 'Online',
        dot: true,
    },
    {
        icon: Database,
        iconBg: 'rgba(147,51,234,0.1)',
        iconColor: '#7c3aed',
        label: 'Database Node',
        getValue: () => 'Connected',
    },
    {
        icon: Server,
        iconBg: 'rgba(245,158,11,0.1)',
        iconColor: '#d97706',
        label: 'Active Zone',
        getValue: (user: any) => user.cityId ? 'City Limited' : 'Global',
    },
];

export default function AdminDashboard() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#1A1D23] tracking-tight">
                    Welcome back, {user.firstName}
                </h1>
                <p className="text-sm text-[#7B8494] mt-1">
                    Current operational status for your deployment zone.
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map(({ icon: Icon, iconBg, iconColor, label, getValue, dot }) => (
                    <div
                        key={label}
                        className="rounded-2xl p-6 transition-all duration-200"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        {/* Icon */}
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                            style={{
                                background: iconBg,
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.3), inset -2px -2px 5px rgba(255,255,255,0.85)',
                            }}
                        >
                            <Icon style={{ width: '1.25rem', height: '1.25rem', color: iconColor }} />
                        </div>

                        <p className="text-xs font-medium text-[#A8B0C0] mb-1 uppercase tracking-wide">{label}</p>
                        <div className="flex items-center gap-2">
                            {dot && (
                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            )}
                            <p className="text-xl font-bold text-[#1A1D23]">{getValue(user)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Security Policy Banner ── */}
            <div
                className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '8px 8px 20px rgba(163,177,198,0.5), -8px -8px 20px rgba(255,255,255,0.92)',
                    border: '1px solid rgba(255,255,255,0.8)',
                }}
            >
                {/* Background watermark */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none hidden md:block">
                    <ShieldAlert style={{ width: '16rem', height: '16rem', color: '#1A1D23' }} />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Zero Trust Architecture Enabled
                    </div>

                    <h2 className="text-xl font-bold text-[#1A1D23] mb-3">Security Policy Active</h2>
                    <p className="text-sm text-[#7B8494] leading-relaxed">
                        You are authenticated as{' '}
                        <span className="font-semibold text-[#1A1D23]">{user.role}</span>.
                        Your session is strictly protected by JWT rotations and bound to authorized capabilities.{' '}
                        {user.role === 'CITY_ADMIN'
                            ? 'You are mapped safely within your local City Zone.'
                            : 'As a Super Admin, you retain platform-wide write access.'}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                        <div
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#4F6BED]"
                            style={{
                                background: '#F0F2F5',
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.85)',
                            }}
                        >
                            🔐 JWT Rotation Active
                        </div>
                        <div
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#7B8494]"
                            style={{
                                background: '#F0F2F5',
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.85)',
                            }}
                        >
                            🛡 Role-Based Access Control
                        </div>
                        <div
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#7B8494]"
                            style={{
                                background: '#F0F2F5',
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.85)',
                            }}
                        >
                            📡 Encrypted Transport
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
