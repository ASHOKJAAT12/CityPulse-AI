import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'SmartCity 360 — AI-Powered City Management',
};

export default function HomePage() {
    return (
        <main className="min-h-screen bg-surface-950 text-white flex flex-col items-center p-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-surface-950 to-accent-900/20 pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between py-6 mb-12">
                <div className="text-xl font-bold tracking-tight gradient-text">
                    SmartCity 360
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-white text-sm font-medium transition-colors border border-surface-700"
                    >
                        Citizen Login
                    </Link>
                    <Link
                        href="/admin/login"
                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-900/20"
                    >
                        Admin Portal
                    </Link>
                </div>
            </header>

            <div className="relative z-10 max-w-4xl w-full text-center space-y-8 mt-4 md:mt-12">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                    Phase 11 — Citizen Reporting Complete
                </div>

                {/* Title */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight gradient-text">
                        SmartCity 360
                    </h1>
                    <p className="text-xl md:text-2xl text-surface-200 max-w-2xl mx-auto text-balance">
                        AI-powered Smart City Management Platform
                    </p>
                    <p className="text-surface-400 max-w-xl mx-auto">
                        Managing water, electricity, traffic, garbage collection, citizen reports,
                        and AI-powered anomaly detection — all from a unified multi-city dashboard.
                    </p>
                </div>

                {/* Services grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {[
                        { icon: '💧', label: 'Water' },
                        { icon: '⚡', label: 'Electricity' },
                        { icon: '🚦', label: 'Traffic' },
                        { icon: '🚛', label: 'Garbage' },
                        { icon: '🔋', label: 'EV Charging' },
                        { icon: '💡', label: 'Street Lights' },
                        { icon: '📋', label: 'Reports' },
                        { icon: '🤖', label: 'AI Brain' },
                    ].map(({ icon, label }) => (
                        <div
                            key={label}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <span className="text-2xl">{icon}</span>
                            <span className="text-xs text-surface-300 font-medium">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Status */}
                <div className="glass rounded-2xl p-6 max-w-lg mx-auto text-left space-y-3">
                    <h2 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">Build Status</h2>
                    <div className="space-y-2">
                        {[
                            { label: 'Backend API', status: 'ready', detail: '/api/v1/health' },
                            { label: 'Database Schema', status: 'ready', detail: 'MongoDB + Mongoose' },
                            { label: 'WebSocket', status: 'ready', detail: 'Socket.IO Events Active' },
                            { label: 'Authentication', status: 'ready', detail: 'Phase 1 Complete' },
                            { label: 'City Dashboard', status: 'ready', detail: 'Phase 3 Complete' },
                            { label: 'Garbage & Vehicles', status: 'ready', detail: 'Phase 5 Complete' },
                            { label: 'Water Management', status: 'ready', detail: 'Phase 6 Complete' },
                            { label: 'Smart Streetlights', status: 'ready', detail: 'Phase 10 Complete' },
                            { label: 'Citizen Reporting', status: 'ready', detail: 'Phase 11 Complete' },
                        ].map(({ label, status, detail }) => (
                            <div key={label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-success-500' :
                                        status === 'stub' ? 'bg-warning-500' :
                                            'bg-surface-700'
                                        }`} />
                                    <span className="text-surface-200">{label}</span>
                                </div>
                                <span className="text-surface-400 text-xs">{detail}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href="/admin/login"
                        className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors focus-ring"
                    >
                        Access Admin Portal ↗
                    </a>
                    <Link
                        href="/city/water"
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors focus-ring"
                    >
                        Citizen View
                    </Link>
                </div>

                <p className="text-surface-600 text-sm">
                    Phase 11 of 20 — Citizen Reporting enabled. Proceeding to Phase 12 when ready.
                </p>
            </div>
        </main>
    );
}
