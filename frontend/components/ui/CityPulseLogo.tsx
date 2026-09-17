'use client';

import React from 'react';

export interface CityPulseLogoProps {
    variant?: 'full' | 'compact' | 'icon';
    theme?: 'light' | 'dark' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    animated?: boolean;
    showTagline?: boolean;
}

export function CityPulseLogo({
    variant = 'full',
    theme = 'light',
    size = 'md',
    className = '',
    animated = true,
    showTagline = false,
}: CityPulseLogoProps) {
    // Dimension presets for icon
    const sizeMap = {
        sm: { icon: 28, text: 'text-sm', badge: 'text-[9px]', sub: 'text-[9px]' },
        md: { icon: 38, text: 'text-lg', badge: 'text-[10px]', sub: 'text-[11px]' },
        lg: { icon: 48, text: 'text-2xl', badge: 'text-xs', sub: 'text-xs' },
        xl: { icon: 60, text: 'text-3xl', badge: 'text-sm', sub: 'text-sm' },
    };

    const currentSize = sizeMap[size] || sizeMap.md;

    // Colors according to theme
    const isDark = theme === 'dark';
    const primaryTextColor = isDark ? '#FFFFFF' : '#1A1D23';
    const subTextColor = isDark ? '#94A3B8' : '#7B8494';

    const iconBoxStyles = isDark
        ? {
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              boxShadow: '0 4px 14px -2px rgba(79, 107, 237, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(79, 107, 237, 0.3)',
          }
        : theme === 'glass'
        ? {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px -4px rgba(79, 107, 237, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
          }
        : {
              background: '#FFFFFF',
              boxShadow: '4px 4px 12px rgba(163, 177, 198, 0.45), -4px -4px 12px rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
          };

    return (
        <div className={`inline-flex items-center gap-3 select-none ${className}`}>
            {/* ── Creative Futuristic SVG Icon Mark ──────────────── */}
            <div
                className="relative rounded-2xl flex items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105 shrink-0 group"
                style={{
                    width: currentSize.icon + 10,
                    height: currentSize.icon + 10,
                    ...iconBoxStyles,
                }}
            >
                {/* Glowing Pulse Ring for Live Feel */}
                {animated && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4F6BED] border-2 border-white"></span>
                    </span>
                )}

                <svg
                    width={currentSize.icon}
                    height={currentSize.icon}
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="overflow-visible"
                >
                    <defs>
                        {/* City Skyline Gradient */}
                        <linearGradient id="cityGrad1" x1="8" y1="36" x2="8" y2="16" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#3B82F6" />
                            <stop offset="1" stopColor="#60A5FA" />
                        </linearGradient>
                        <linearGradient id="cityGrad2" x1="20" y1="36" x2="20" y2="8" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4F6BED" />
                            <stop offset="1" stopColor="#818CF8" />
                        </linearGradient>
                        <linearGradient id="cityGrad3" x1="32" y1="36" x2="32" y2="14" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#06B6D4" />
                            <stop offset="1" stopColor="#38BDF8" />
                        </linearGradient>
                        <linearGradient id="cityGrad4" x1="40" y1="36" x2="40" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#8B5CF6" />
                            <stop offset="1" stopColor="#A78BFA" />
                        </linearGradient>

                        {/* Pulse Heartbeat Wave Gradient */}
                        <linearGradient id="pulseGrad" x1="2" y1="28" x2="46" y2="28" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#06B6D4" />
                            <stop offset="0.4" stopColor="#4F6BED" />
                            <stop offset="0.7" stopColor="#10B981" />
                            <stop offset="1" stopColor="#06B6D4" />
                        </linearGradient>

                        {/* Glow Filter */}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Background Digital Grid Glow Dots */}
                    <circle cx="10" cy="10" r="1" fill="#818CF8" opacity="0.4" />
                    <circle cx="38" cy="10" r="1" fill="#38BDF8" opacity="0.4" />
                    <circle cx="24" cy="5" r="1.2" fill="#06B6D4" opacity="0.6" />

                    {/* Building 1 (Left low tower) */}
                    <rect x="5" y="20" width="8" height="18" rx="1.5" fill="url(#cityGrad1)" opacity="0.85" />
                    {/* Building 1 Windows */}
                    <rect x="7" y="23" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />
                    <rect x="7" y="27" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />
                    <rect x="10" y="23" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />
                    <rect x="10" y="27" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />

                    {/* Building 2 (Central High-tech Skyscraper) */}
                    <rect x="16" y="9" width="10" height="29" rx="2" fill="url(#cityGrad2)" />
                    {/* Spire antenna with beacon light */}
                    <line x1="21" y1="9" x2="21" y2="4" stroke="#4F6BED" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="21" cy="3.5" r="1.5" fill="#06B6D4" filter="url(#glow)" />
                    {/* Windows grid */}
                    <rect x="18" y="13" width="2" height="2.2" rx="0.5" fill="#FFFFFF" opacity="0.85" />
                    <rect x="22" y="13" width="2" height="2.2" rx="0.5" fill="#FFFFFF" opacity="0.85" />
                    <rect x="18" y="18" width="2" height="2.2" rx="0.5" fill="#FFFFFF" opacity="0.85" />
                    <rect x="22" y="18" width="2" height="2.2" rx="0.5" fill="#FFFFFF" opacity="0.85" />
                    <rect x="18" y="23" width="2" height="2.2" rx="0.5" fill="#FFFFFF" opacity="0.85" />
                    <rect x="22" y="23" width="2" height="2.2" rx="0.5" fill="#FFFFFF" opacity="0.85" />

                    {/* Building 3 (Right Mid Tower) */}
                    <rect x="29" y="15" width="8" height="23" rx="1.5" fill="url(#cityGrad3)" opacity="0.9" />
                    {/* Windows */}
                    <rect x="31" y="18" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />
                    <rect x="34" y="18" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />
                    <rect x="31" y="22" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />
                    <rect x="34" y="22" width="1.8" height="2" rx="0.5" fill="#FFFFFF" opacity="0.75" />

                    {/* Building 4 (Far Right Modern Tower) */}
                    <rect x="39" y="22" width="6" height="16" rx="1.5" fill="url(#cityGrad4)" opacity="0.85" />
                    <rect x="41" y="25" width="2" height="2" rx="0.5" fill="#FFFFFF" opacity="0.7" />

                    {/* ── Dynamic ECG Pulse Wave Passing Across City Base ──── */}
                    <path
                        d="M 2 34 L 12 34 L 15 28 L 18 39 L 21 23 L 24 41 L 27 31 L 30 36 L 33 34 L 46 34"
                        stroke="url(#pulseGrad)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                    />

                    {/* Floating Pulse Sensor Nodes */}
                    <circle cx="21" cy="23" r="2.2" fill="#FFFFFF" stroke="#4F6BED" strokeWidth="1.2" filter="url(#glow)" />
                    <circle cx="24" cy="41" r="1.8" fill="#10B981" />
                    <circle cx="15" cy="28" r="1.5" fill="#06B6D4" />
                </svg>
            </div>

            {/* ── Typography & AI Badge ──────────────────────────── */}
            {variant !== 'icon' && (
                <div className="flex flex-col">
                    <div className={`font-extrabold tracking-tight flex items-center gap-1.5 ${currentSize.text}`}>
                        <span style={{ color: primaryTextColor }}>City</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4F6BED] via-[#6366F1] to-[#06B6D4]">
                            Pulse
                        </span>

                        {/* High-tech AI Badge */}
                        <div
                            className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg ml-0.5 ${currentSize.badge}`}
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(79,107,237,0.25) 0%, rgba(6,182,212,0.25) 100%)'
                                    : 'linear-gradient(135deg, rgba(79,107,237,0.12) 0%, rgba(6,182,212,0.12) 100%)',
                                border: isDark
                                    ? '1px solid rgba(99,102,241,0.4)'
                                    : '1px solid rgba(79,107,237,0.25)',
                                color: isDark ? '#38BDF8' : '#4F6BED',
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse"></span>
                            AI
                        </div>
                    </div>

                    {showTagline && variant === 'full' && (
                        <p className={`font-medium tracking-wide leading-none mt-0.5 ${currentSize.sub}`} style={{ color: subTextColor }}>
                            Cognitive Smart City Platform
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default CityPulseLogo;
