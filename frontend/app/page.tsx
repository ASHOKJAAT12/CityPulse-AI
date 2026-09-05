import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'SmartCity 360 — AI-Powered City Management',
};

export default function HomePage() {
    return (
        <main className="min-h-screen bg-surface-950 text-white flex flex-col items-center justify-center p-8">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-surface-950 to-accent-900/20 pointer-events-none" />

            <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                    Phase 0 — Foundation Complete
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
                            { label: 'Database Schema', status: 'ready', detail: 'Prisma + PostgreSQL' },
                            { label: 'WebSocket', status: 'stub', detail: 'Socket.IO — Phase 7' },
                            { label: 'Authentication', status: 'pending', detail: 'Phase 1' },
                            { label: 'City Dashboard', status: 'pending', detail: 'Phase 3' },
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
                        href="http://localhost:5000/api/v1/health"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors focus-ring"
                    >
                        Check API Health ↗
                    </a>
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors focus-ring"
                    >
                        View Docs
                    </Link>
                </div>

                <p className="text-surface-600 text-sm">
                    Phase 0 of 20 — Foundation established. Proceed to Phase 1 when ready.
                </p>
            </div>
        </main>
    );
}
