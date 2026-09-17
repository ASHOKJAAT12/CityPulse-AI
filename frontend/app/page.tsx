'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Droplets,
    Zap,
    Car,
    Trash2,
    BatteryCharging,
    Lightbulb,
    FileText,
    Cpu,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    Users,
    Building2,
    Sparkles,
    Radio,
    MapPin,
    Activity,
    BarChart3,
    Clock,
    Smartphone,
    AlertTriangle,
    Check,
    ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';

export default function HomePage() {
    // User benefit perspective toggle: 'citizens' | 'municipalities'
    const [activeAudience, setActiveAudience] = useState<'citizens' | 'municipalities'>('citizens');

    // Selected infrastructure pillar for interactive preview
    const [selectedService, setSelectedService] = useState<number>(0);

    const infrastructurePillars = [
        {
            id: 'water',
            icon: Droplets,
            title: 'Water Management',
            tag: 'Pipeline & Quality Telemetry',
            color: '#0284C7',
            bgLight: 'rgba(2,132,199,0.08)',
            shortDesc: 'Automated pressure sensing, leak prediction, water quality analysis, and supply schedules.',
            details: [
                'Continuous real-time flow rate, pressure, and purity telemetry across municipal distribution networks.',
                'AI leak and pressure surge forecasting prevents catastrophic pipeline bursts before they flood streets.',
                'Automated supply distribution scheduling and instant SMS/in-app outage notifications for residents.',
            ],
            metrics: '99.4% Grid Uptime • 35% Faster Leak Repairs',
        },
        {
            id: 'electricity',
            icon: Zap,
            title: 'Electricity & Grid',
            tag: 'Smart Energy & Load Balance',
            color: '#F59E0B',
            bgLight: 'rgba(245,158,11,0.08)',
            shortDesc: 'Substation health monitoring, predictive outage alerts, and dynamic load balancing.',
            details: [
                'Live substation load balancing, phase fluctuation tracking, and transformer thermal monitoring.',
                'Proactive outage prediction flags transformer fatigue and triggers maintenance before neighborhood blackouts occur.',
                'Harmonized energy routing with municipal EV charging grids to prevent peak-hour grid overload.',
            ],
            metrics: '< 15 min Fault Localization • 22% Peak Load Reduction',
        },
        {
            id: 'traffic',
            icon: Car,
            title: 'Traffic & Mobility',
            tag: 'Dynamic Congestion Optimization',
            color: '#EF4444',
            bgLight: 'rgba(239,68,68,0.08)',
            shortDesc: 'Sensor-driven intersection sync, live incident rerouting, and road closure tracking.',
            details: [
                'Real-time traffic density sensor telemetry synchronizes traffic signals to clear bottlenecks dynamically.',
                'Immediate incident detection reroutes transit fleets and alerts drivers of sudden roadworks or blockages.',
                'Emergency vehicle preemption clears green corridors for ambulances and fire trucks automatically.',
            ],
            metrics: '18% Less Commute Delays • Automatic Emergency Corridors',
        },
        {
            id: 'garbage',
            icon: Trash2,
            title: 'Waste & Sanitation',
            tag: 'Live Fleet GPS & Bin Sensors',
            color: '#10B981',
            bgLight: 'rgba(16,185,129,0.08)',
            shortDesc: 'GPS garbage vehicle tracking, smart bin fill sensors, and optimized collection routes.',
            details: [
                'Live GPS tracking lets citizens see municipal collection trucks approaching their street in real time.',
                'Smart ultrasonic bin fill-level sensors eliminate overflowing trash bins by prioritizing pickups.',
                'AI-optimized collection routes cut municipal fleet fuel consumption and urban carbon emissions.',
            ],
            metrics: '30% Fuel Savings • 100% On-Time Neighborhood Pickups',
        },
        {
            id: 'ev',
            icon: BatteryCharging,
            title: 'EV Charging Network',
            tag: 'Stall Availability & Reservations',
            color: '#6366F1',
            bgLight: 'rgba(99,102,241,0.08)',
            shortDesc: 'Live charger availability, connector compatibility checks, and slot booking.',
            details: [
                'Unified map of all city-wide charging hubs with live connector status (Type 2, CCS2, CHAdeMO).',
                'Advance slot reservation prevents frustrating charging queues and guarantees a working port.',
                'Smart charging session monitoring with real-time kilowatt draw and automated digital billing.',
            ],
            metrics: 'Zero Queue Anxiety • 100% Real-Time Port Availability',
        },
        {
            id: 'streetlight',
            icon: Lightbulb,
            title: 'Smart Streetlights',
            tag: 'Zone Automation & Dimming',
            color: '#EAB308',
            bgLight: 'rgba(234,179,8,0.08)',
            shortDesc: 'Adaptive ambient dimming, automated dusk-to-dawn schedules, and rapid fault reporting.',
            details: [
                'Ambient light and motion-sensing dimming saves up to 40% municipal electricity without compromising safety.',
                'Automated fault detection alerts repair crews immediately if a bulb fails or experiences wiring faults.',
                'Centralized zone schedules ensure public parks, school corridors, and highways stay illuminated securely.',
            ],
            metrics: '40% Municipal Energy Savings • 24/7 Automated Dark-Spot Audits',
        },
        {
            id: 'reporting',
            icon: FileText,
            title: 'Citizen Civic Reporting',
            tag: 'Geo-Tagged Issue Resolution',
            color: '#8B5CF6',
            bgLight: 'rgba(139,92,246,0.08)',
            shortDesc: 'Photo & GPS report submission, live repair timelines, and direct departmental accountability.',
            details: [
                'Citizens snap photos of potholes, fallen trees, or leaks; the platform automatically geotags and categorizes them.',
                'Direct routing to responsible municipal teams eliminates bureaucratic delays and lost paperwork.',
                'Transparent timeline gives citizens step-by-step visibility from ticket submission to completed repair.',
            ],
            metrics: 'Sub-30s Report Filing • 48h Median Resolution Time',
        },
        {
            id: 'ai-brain',
            icon: Cpu,
            title: 'AI Brain & Digital Twin',
            tag: 'Cross-Domain Anomaly Engine',
            color: '#4F6BED',
            bgLight: 'rgba(79,107,237,0.08)',
            shortDesc: 'Holistic urban simulation, cross-sensor anomaly correlation, and predictive maintenance.',
            details: [
                'Continuously ingests multi-domain telemetry to correlate events (e.g. water pipe rupture causing traffic diversion).',
                'Predictive asset risk scoring alerts city engineers weeks before critical infrastructure breakdowns occur.',
                'Simulates storm scenarios and traffic surges using the city’s real-time digital twin node graph.',
            ],
            metrics: 'Sub-Second Anomaly Detection • Predictive City-Wide Prevention',
        },
    ];

    const citizenBenefits = [
        {
            icon: Smartphone,
            title: 'One-Tap Civic Reporting',
            desc: 'Report broken streetlights, potholes, open manholes, or water leaks in 30 seconds with photo uploads and automatic GPS location.',
        },
        {
            icon: Activity,
            title: 'Live City Awareness & Alerts',
            desc: 'Receive proactive alerts about scheduled water shutoffs, grid maintenance, major traffic bottlenecks, and neighborhood advisories.',
        },
        {
            icon: Trash2,
            title: 'Track Garbage Trucks Live',
            desc: 'Never miss morning waste pickup again. Watch collection trucks moving toward your street live on an interactive map.',
        },
        {
            icon: BatteryCharging,
            title: 'Guaranteed EV Charging',
            desc: 'Find nearby operational EV chargers, verify port compatibility, and reserve a charging stall before arriving.',
        },
        {
            icon: Clock,
            title: 'Transparent Resolution Timelines',
            desc: 'Follow the exact progress of your civic reports from submission to assignment, field crew dispatch, and photo-verified completion.',
        },
        {
            icon: ShieldCheck,
            title: 'Safer, Well-Maintained Streets',
            desc: 'Continuous streetlight health monitoring and prompt municipal response ensure your family walks on safe, well-lit roads.',
        },
    ];

    const municipalityBenefits = [
        {
            icon: Building2,
            title: 'Single Pane of Glass',
            desc: 'Consolidate water, electricity, traffic, sanitation, and streetlights into one unified, real-time command dashboard.',
        },
        {
            icon: Cpu,
            title: 'AI-Powered Preventive Maintenance',
            desc: 'Detect pipe pressure spikes, electrical transformer overheating, and road deterioration before catastrophic failures occur.',
        },
        {
            icon: BarChart3,
            title: 'Fleet & Fuel Cost Optimization',
            desc: 'Dynamic routing for waste collection vehicles and service vans cuts city fuel expenditures and reduces urban carbon emissions.',
        },
        {
            icon: AlertTriangle,
            title: 'Cross-Department Emergency Dispatch',
            desc: 'When major emergencies happen, automatically coordinate response teams, road closures, and utility shutdowns simultaneously.',
        },
        {
            icon: CheckCircle2,
            title: 'Actionable SLA & Citizen Trust',
            desc: 'Track departmental resolution speed, hold field contractors accountable, and demonstrate transparent governance to taxpayers.',
        },
        {
            icon: Sparkles,
            title: 'Digital Twin City Simulation',
            desc: 'Model future urban growth, grid demands, and severe weather impacts using historical telemetry and real-time digital twin nodes.',
        },
    ];

    return (
        <main
            className="min-h-screen flex flex-col items-center selection:bg-[#4F6BED] selection:text-white"
            style={{ backgroundColor: '#F0F2F5', color: '#1A1D23' }}
        >
            {/* ── Sticky Transparent Glass Navbar ────────────────── */}
            <Navbar />

            {/* ── Hero Section ─────────────────────────────────── */}
            <section className="max-w-5xl w-full px-6 pt-10 pb-16 text-center space-y-8">
                {/* Hero Badge */}
                <div
                    className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-[#4F6BED]"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '4px 4px 10px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.8)',
                    }}
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>AI-Powered Urban Infrastructure & Civic Intelligence</span>
                </div>

                {/* Hero Main Headline */}
                <div className="space-y-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1A1D23] leading-[1.15]">
                        The Real-Time Neural System for{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #4F6BED 0%, #06B6D4 50%, #10B981 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Smarter, Safer Cities
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-[#7B8494] max-w-3xl mx-auto leading-relaxed">
                        CityPulse AI bridges municipal authorities and residents into one synchronized ecosystem.
                        We transform raw IoT data from water pipes, power grids, traffic networks, and waste fleets into
                        instant civic action and proactive city management.
                    </p>
                </div>

                {/* Primary Call To Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                            boxShadow: '6px 6px 16px rgba(79,107,237,0.38), -4px -4px 12px rgba(255,255,255,0.9)',
                        }}
                    >
                        <span>Access Citizen Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/admin/login"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-base font-semibold text-[#1A1D23] flex items-center justify-center gap-2 transition-all duration-200 hover:text-[#4F6BED] active:scale-95"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        <span>City Administration Command</span>
                        <Building2 className="w-4 h-4 text-[#7B8494]" />
                    </Link>
                </div>

            </section>

            {/* ── Section 2: How It Helps You (Audience Switcher) ──── */}
            <section id="how-it-helps" className="w-full max-w-6xl px-6 py-16 space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <span
                        className="text-xs font-bold uppercase tracking-widest text-[#4F6BED] px-3 py-1 rounded-full"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -3px -3px 8px rgba(255,255,255,0.9)',
                        }}
                    >
                        Tailored Value
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1D23] tracking-tight">
                        How CityPulse AI Helps You
                    </h2>
                    <p className="text-[#7B8494] text-base leading-relaxed">
                        Whether you are an everyday city resident heading to work or a city official managing municipal
                        operations, CityPulse AI provides the exact tools and clarity you need.
                    </p>

                    {/* Neumorphic Segmented Switcher */}
                    <div className="flex justify-center pt-4">
                        <div
                            className="p-1.5 rounded-2xl flex items-center gap-2"
                            style={{
                                background: '#E8ECF2',
                                boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)',
                            }}
                        >
                            <button
                                onClick={() => setActiveAudience('citizens')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={
                                    activeAudience === 'citizens'
                                        ? {
                                              background: '#FFFFFF',
                                              color: '#4F6BED',
                                              boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -2px -2px 6px rgba(255,255,255,0.9)',
                                          }
                                        : {
                                              background: 'transparent',
                                              color: '#7B8494',
                                          }
                                }
                            >
                                <Users className="w-4 h-4" />
                                <span>For Citizens & Residents</span>
                            </button>

                            <button
                                onClick={() => setActiveAudience('municipalities')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={
                                    activeAudience === 'municipalities'
                                        ? {
                                              background: '#FFFFFF',
                                              color: '#4F6BED',
                                              boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -2px -2px 6px rgba(255,255,255,0.9)',
                                          }
                                        : {
                                              background: 'transparent',
                                              color: '#7B8494',
                                          }
                                }
                            >
                                <Building2 className="w-4 h-4" />
                                <span>For City Officials & Admins</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Benefits Grid based on active toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeAudience === 'citizens' ? citizenBenefits : municipalityBenefits).map((benefit, idx) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={idx}
                                className="p-6 rounded-3xl space-y-3 transition-all duration-300 hover:shadow-lg"
                                style={{
                                    background: '#FFFFFF',
                                    boxShadow: '5px 5px 14px rgba(163,177,198,0.45), -5px -5px 14px rgba(255,255,255,0.92)',
                                    border: '1px solid rgba(255,255,255,0.8)',
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{
                                        background: '#F0F2F5',
                                        color: '#4F6BED',
                                        boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.9)',
                                    }}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-[#1A1D23]">{benefit.title}</h3>
                                <p className="text-xs sm:text-sm text-[#7B8494] leading-relaxed">{benefit.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Quick CTA to matching portal */}
                <div className="text-center pt-4">
                    {activeAudience === 'citizens' ? (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Link
                                href="/register"
                                className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                    boxShadow: '4px 4px 12px rgba(79,107,237,0.35), -2px -2px 8px rgba(255,255,255,0.8)',
                                }}
                            >
                                Register as a Citizen ↗
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-3 rounded-xl text-sm font-semibold text-[#7B8494] transition-all duration-200 hover:text-[#1A1D23]"
                                style={{
                                    background: '#FFFFFF',
                                    boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -3px -3px 8px rgba(255,255,255,0.9)',
                                }}
                            >
                                Already have an account? Sign In
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Link
                                href="/admin/login"
                                className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                    boxShadow: '4px 4px 12px rgba(79,107,237,0.35), -2px -2px 8px rgba(255,255,255,0.8)',
                                }}
                            >
                                Sign In to Admin Command ↗
                            </Link>
                            <span className="text-xs text-[#7B8494] flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Role-based access control with city-scoped encryption
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Section 3: Interactive Infrastructure Pillars ───── */}
            <section id="pillars" className="w-full max-w-6xl px-6 py-16 space-y-12">
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <span
                        className="text-xs font-bold uppercase tracking-widest text-[#4F6BED] px-3 py-1 rounded-full"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -3px -3px 8px rgba(255,255,255,0.9)',
                        }}
                    >
                        Unified Urban Ecosystem
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1D23] tracking-tight">
                        8 Critical City Services on One Platform
                    </h2>
                    <p className="text-[#7B8494] text-base leading-relaxed">
                        Explore how CityPulse AI continuously monitors, predicts, and automates each core municipal sector.
                        Click any service below to review its capabilities.
                    </p>
                </div>

                {/* Service Selector Pills */}
                <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
                    {infrastructurePillars.map((item, idx) => {
                        const Icon = item.icon;
                        const isSelected = selectedService === idx;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSelectedService(idx)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200"
                                style={
                                    isSelected
                                        ? {
                                              background: '#FFFFFF',
                                              color: item.color,
                                              boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.95)',
                                              border: `1.5px solid ${item.color}`,
                                          }
                                        : {
                                              background: '#FFFFFF',
                                              color: '#7B8494',
                                              boxShadow: '3px 3px 8px rgba(163,177,198,0.35), -3px -3px 8px rgba(255,255,255,0.9)',
                                              border: '1px solid rgba(255,255,255,0.8)',
                                          }
                                }
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Service Detailed Feature Card */}
                {(() => {
                    const activeItem = infrastructurePillars[selectedService];
                    const Icon = activeItem.icon;
                    return (
                        <div
                            className="p-8 sm:p-10 rounded-3xl max-w-4xl mx-auto space-y-6 transition-all duration-300"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '8px 8px 22px rgba(163,177,198,0.5), -8px -8px 22px rgba(255,255,255,0.95)',
                                border: '1px solid rgba(255,255,255,0.85)',
                            }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8ECF2] pb-6">
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                        style={{
                                            background: activeItem.bgLight,
                                            color: activeItem.color,
                                            boxShadow: `inset 2px 2px 6px ${activeItem.bgLight}`,
                                        }}
                                    >
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-[#1A1D23]">{activeItem.title}</h3>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-[#7B8494]">
                                            {activeItem.tag}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1A1D23] self-start sm:self-auto"
                                    style={{
                                        background: '#F0F2F5',
                                        boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.4), inset -2px -2px 4px rgba(255,255,255,0.85)',
                                    }}
                                >
                                    ⚡ {activeItem.metrics}
                                </div>
                            </div>

                            <p className="text-base text-[#1A1D23] font-medium leading-relaxed">{activeItem.shortDesc}</p>

                            {/* Bullet Features */}
                            <div className="space-y-3 pt-2">
                                {activeItem.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                            style={{
                                                background: activeItem.bgLight,
                                                color: activeItem.color,
                                            }}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-xs sm:text-sm text-[#7B8494] leading-relaxed">{detail}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-[#E8ECF2]">
                                <span className="text-xs text-[#A8B0C0]">Fully integrated with PostGIS geospatial engine</span>
                                <Link
                                    href="/app"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F6BED] hover:underline"
                                >
                                    <span>View live city map</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })()}
            </section>

            {/* ── Section 4: How It Works (The 3-Step Flow) ────────── */}
            <section id="how-it-works" className="w-full max-w-6xl px-6 py-16 space-y-12">
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <span
                        className="text-xs font-bold uppercase tracking-widest text-[#4F6BED] px-3 py-1 rounded-full"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -3px -3px 8px rgba(255,255,255,0.9)',
                        }}
                    >
                        End-to-End Workflow
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1D23] tracking-tight">
                        How CityPulse AI Works
                    </h2>
                    <p className="text-[#7B8494] text-base leading-relaxed">
                        A seamless, automated pipeline transforming sensor signals and citizen inputs into resolved urban actions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                    {[
                        {
                            step: '01',
                            title: 'Data Collection & Ingestion',
                            desc: 'Sensors across water mains, electricity transformers, garbage trucks, and streetlights stream live telemetry alongside geotagged citizen reports.',
                            icon: Radio,
                        },
                        {
                            step: '02',
                            title: 'AI Processing & Anomaly Detection',
                            desc: 'The platform’s neural engine evaluates incoming streams in real time, detecting anomalies, forecasting equipment stress, and verifying duplicates.',
                            icon: Cpu,
                        },
                        {
                            step: '03',
                            title: 'Automated Dispatch & Resolution',
                            desc: 'Work orders are automatically generated and dispatched to the right municipal department. Citizens track the field crew and get photo confirmation.',
                            icon: CheckCircle2,
                        },
                    ].map((stepItem, index) => {
                        const Icon = stepItem.icon;
                        return (
                            <div
                                key={index}
                                className="p-7 rounded-3xl space-y-4 relative"
                                style={{
                                    background: '#FFFFFF',
                                    boxShadow: '6px 6px 16px rgba(163,177,198,0.45), -6px -6px 16px rgba(255,255,255,0.92)',
                                    border: '1px solid rgba(255,255,255,0.8)',
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                                        style={{
                                            background: 'rgba(79,107,237,0.1)',
                                            color: '#4F6BED',
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-3xl font-black text-[#E2E8F0]">{stepItem.step}</span>
                                </div>
                                <h3 className="text-lg font-bold text-[#1A1D23]">{stepItem.title}</h3>
                                <p className="text-xs sm:text-sm text-[#7B8494] leading-relaxed">{stepItem.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Section 5: Bottom Call To Action Banner ───────────── */}
            <section className="w-full max-w-5xl px-6 py-12">
                <div
                    className="p-8 sm:p-12 rounded-3xl text-center space-y-6"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '10px 10px 24px rgba(163,177,198,0.55), -10px -10px 24px rgba(255,255,255,0.95)',
                        border: '1px solid rgba(255,255,255,0.85)',
                    }}
                >
                    <div
                        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl"
                        style={{
                            background: 'rgba(79,107,237,0.1)',
                            color: '#4F6BED',
                        }}
                    >
                        <Sparkles className="w-7 h-7" />
                    </div>

                    <div className="space-y-2 max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D23]">
                            Ready to Experience the Future of Urban Living?
                        </h2>
                        <p className="text-sm sm:text-base text-[#7B8494]">
                            Explore live city metrics, report civic issues, track garbage collection, and monitor infrastructure health in real time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                        <Link
                            href="/login"
                            className="px-7 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                boxShadow: '5px 5px 14px rgba(79,107,237,0.38), -3px -3px 10px rgba(255,255,255,0.9)',
                            }}
                        >
                            Open Citizen Dashboard ↗
                        </Link>
                        <Link
                            href="/admin/login"
                            className="px-7 py-3.5 rounded-2xl text-sm font-semibold text-[#1A1D23] transition-all duration-200 hover:text-[#4F6BED]"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '5px 5px 12px rgba(163,177,198,0.45), -5px -5px 12px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            Municipal Operations Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="w-full border-t border-[#E2E8F0] mt-12 py-10">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -3px -3px 8px rgba(255,255,255,0.9)',
                            }}
                        >
                            🏙️
                        </div>
                        <span className="text-sm font-bold text-[#1A1D23]">CityPulse AI</span>
                        <span className="text-xs text-[#A8B0C0]">| SmartCity 360 Urban Platform</span>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-[#7B8494]">
                        <Link href="/login" className="hover:text-[#4F6BED] transition-colors">
                            Citizen Portal
                        </Link>
                        <Link href="/admin/login" className="hover:text-[#4F6BED] transition-colors">
                            Admin Command
                        </Link>
                        <Link href="/register" className="hover:text-[#4F6BED] transition-colors">
                            Sign Up
                        </Link>
                    </div>

                    <div className="text-xs text-[#A8B0C0] text-center sm:text-right">
                        © {new Date().getFullYear()} CityPulse AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </main>
    );
}
