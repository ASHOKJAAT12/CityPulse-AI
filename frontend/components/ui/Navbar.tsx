'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, Shield, User, Building2 } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper for navigation links (scroll on home, navigate from other pages)
    const getNavHref = (hash: string) => {
        return pathname === '/' ? hash : `/${hash}`;
    };

    const isHome = pathname === '/';
    const isLogin = pathname === '/login';
    const isRegister = pathname === '/register';
    const isAdminLogin = pathname === '/admin/login';
    const isAdminRegister = pathname === '/admin/register';

    return (
        <header
            className="sticky top-0 z-50 w-full transition-all duration-300"
            style={{
                backgroundColor: scrolled
                    ? 'rgba(240, 242, 245, 0.85)'
                    : 'rgba(240, 242, 245, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: scrolled
                    ? '1px solid rgba(255, 255, 255, 0.75)'
                    : '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: scrolled
                    ? '0 6px 20px -4px rgba(163, 177, 198, 0.35), 0 2px 6px -1px rgba(255, 255, 255, 0.9)'
                    : '0 2px 10px -2px rgba(163, 177, 198, 0.15)',
            }}
        >
            <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
                {/* ── Brand Logo ──────────────────────────────── */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-105"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '4px 4px 10px rgba(163,177,198,0.45), -4px -4px 10px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        🏙️
                    </div>
                    <div>
                        <div className="text-lg font-bold text-[#1A1D23] tracking-tight flex items-center gap-1.5">
                            CityPulse AI
                            <span
                                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full text-[#4F6BED]"
                                style={{
                                    background: 'rgba(79,107,237,0.1)',
                                }}
                            >
                                Live
                            </span>
                        </div>
                        <p className="text-[11px] text-[#7B8494] hidden sm:block">Cognitive Smart City Platform</p>
                    </div>
                </Link>

                {/* ── Desktop Navigation Links ─────────────────── */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#7B8494]">
                    <a
                        href={getNavHref('#how-it-helps')}
                        className="hover:text-[#4F6BED] transition-colors"
                    >
                        How It Helps You
                    </a>
                    <a
                        href={getNavHref('#pillars')}
                        className="hover:text-[#4F6BED] transition-colors"
                    >
                        City Infrastructure
                    </a>
                    <a
                        href={getNavHref('#how-it-works')}
                        className="hover:text-[#4F6BED] transition-colors"
                    >
                        Architecture
                    </a>
                </nav>

                {/* ── Desktop Action Buttons ───────────────────── */}
                <div className="hidden sm:flex items-center gap-3">
                    {/* Citizen Option */}
                    {isLogin ? (
                        <Link
                            href="/register"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1A1D23] transition-all duration-200 hover:text-[#4F6BED]"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.45), -3px -3px 8px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            Create Citizen Account
                        </Link>
                    ) : isRegister ? (
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1A1D23] transition-all duration-200 hover:text-[#4F6BED]"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.45), -3px -3px 8px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            Citizen Sign In
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#1A1D23] transition-all duration-200 hover:text-[#4F6BED]"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.45), -3px -3px 8px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            Citizen Portal
                        </Link>
                    )}

                    {/* Admin Option */}
                    {isAdminLogin || isAdminRegister ? (
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#4F6BED] transition-all duration-200"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.45), -3px -3px 8px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            ← Citizen View
                        </Link>
                    ) : (
                        <Link
                            href="/admin/login"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center gap-1"
                            style={{
                                background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                boxShadow: '4px 4px 12px rgba(79,107,237,0.35), -2px -2px 8px rgba(255,255,255,0.8)',
                            }}
                        >
                            <span>Admin Portal</span>
                            <span className="text-xs">↗</span>
                        </Link>
                    )}
                </div>

                {/* ── Mobile Menu Toggle ───────────────────────── */}
                <div className="flex sm:hidden items-center gap-2">
                    <Link
                        href={isAdminLogin ? '/login' : '/admin/login'}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4F6BED]"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '2px 2px 6px rgba(163,177,198,0.35), -2px -2px 6px rgba(255,255,255,0.85)',
                        }}
                    >
                        {isAdminLogin ? 'Citizen' : 'Admin'}
                    </Link>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#1A1D23] transition-all duration-200"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '3px 3px 8px rgba(163,177,198,0.4), -3px -3px 8px rgba(255,255,255,0.9)',
                        }}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ── Mobile Dropdown Menu (Glassmorphism) ──────────── */}
            {mobileMenuOpen && (
                <div
                    className="sm:hidden px-6 pt-3 pb-5 space-y-3 border-t border-white/50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{
                        backgroundColor: 'rgba(240, 242, 245, 0.94)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="flex flex-col gap-2 py-2">
                        <a
                            href={getNavHref('#how-it-helps')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-xl text-sm font-medium text-[#1A1D23] hover:text-[#4F6BED] hover:bg-white/60 transition-all"
                        >
                            How It Helps You
                        </a>
                        <a
                            href={getNavHref('#pillars')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-xl text-sm font-medium text-[#1A1D23] hover:text-[#4F6BED] hover:bg-white/60 transition-all"
                        >
                            City Infrastructure
                        </a>
                        <a
                            href={getNavHref('#how-it-works')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-xl text-sm font-medium text-[#1A1D23] hover:text-[#4F6BED] hover:bg-white/60 transition-all"
                        >
                            Architecture
                        </a>
                    </div>

                    <div className="pt-2 border-t border-white/60 flex flex-col gap-2.5">
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-[#1A1D23]"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.35), -3px -3px 8px rgba(255,255,255,0.85)',
                            }}
                        >
                            Citizen Login
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-[#4F6BED]"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '3px 3px 8px rgba(163,177,198,0.35), -3px -3px 8px rgba(255,255,255,0.85)',
                            }}
                        >
                            Register as Citizen
                        </Link>
                        <Link
                            href="/admin/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white"
                            style={{
                                background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                boxShadow: '4px 4px 12px rgba(79,107,237,0.35)',
                            }}
                        >
                            Admin Portal Command ↗
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
export default Navbar;
