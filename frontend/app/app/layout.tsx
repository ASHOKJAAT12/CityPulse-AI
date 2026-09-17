'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { CitySearchBox } from '../../components/ui/CitySearchBox';
import { NotificationBell } from '../../components/ui/NotificationBell';
import {
    LogOut, LayoutDashboard, User, Settings as SettingsIcon,
    Droplet, Zap, Navigation, Battery, Lightbulb, Trash2, Edit3, ClipboardList,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
    {
        section: 'Main',
        links: [
            { href: '/app', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        ],
    },
    {
        section: 'City Services',
        links: [
            { href: '/city/water',        icon: Droplet,       label: 'Water System' },
            { href: '/city/electricity',   icon: Zap,           label: 'Power Grid' },
            { href: '/city/traffic',       icon: Navigation,    label: 'Traffic Monitor' },
            { href: '/city/ev',            icon: Battery,       label: 'EV Stations' },
            { href: '/city/streetlights',  icon: Lightbulb,     label: 'Street Lights' },
            { href: '/city/garbage',       icon: Trash2,        label: 'Waste Mgmt' },
        ],
    },
    {
        section: 'Incident Reporting',
        links: [
            { href: '/city/report',      icon: Edit3,        label: 'Report Issue', exact: true },
            { href: '/city/my-reports',  icon: ClipboardList, label: 'My Reports', exact: true },
        ],
    },
    {
        section: 'Account',
        links: [
            { href: '/app/profile',   icon: User,         label: 'Profile', exact: true },
            { href: '/app/settings',  icon: SettingsIcon, label: 'Settings', exact: true },
        ],
    },
];

function NavLink({ href, icon: Icon, label, exact, pathname }: {
    href: string;
    icon: React.ElementType;
    label: string;
    exact?: boolean;
    pathname: string;
}) {
    const isActive = exact ? pathname === href : pathname.startsWith(href) && (href !== '/app' || pathname === '/app');

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium gap-3 transition-all duration-200 group',
                isActive
                    ? [
                        'text-[#4F6BED]',
                        'shadow-[inset_3px_3px_8px_rgba(163,177,198,0.45),_inset_-3px_-3px_8px_rgba(255,255,255,0.9)]',
                        'bg-[#F0F2F5]',
                    ]
                    : [
                        'text-[#7B8494]',
                        'hover:text-[#1A1D23]',
                        'hover:bg-white',
                        'hover:shadow-[3px_3px_8px_rgba(163,177,198,0.4),_-3px_-3px_8px_rgba(255,255,255,0.85)]',
                    ]
            )}
        >
            <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-[#4F6BED]' : 'text-[#A8B0C0] group-hover:text-[#7B8494]')} />
            <span>{label}</span>
            {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4F6BED] shrink-0" />
            )}
        </Link>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading, currentCity, checkSession, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center gap-4"
                style={{ backgroundColor: '#F0F2F5' }}
            >
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.92)',
                    }}
                >
                    🏙️
                </div>
                <p className="text-sm font-medium text-[#7B8494] tracking-wide">
                    Loading CityPulse AI...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex font-sans" style={{ backgroundColor: '#F0F2F5' }}>

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside
                className="w-64 hidden md:flex flex-col shrink-0"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '4px 0 12px rgba(163,177,198,0.35)',
                    borderRight: '1px solid rgba(255,255,255,0.8)',
                }}
            >
                {/* Logo */}
                <div className="p-5 border-b border-[#F0F2F5]">
                    <Link href="/app" className="flex items-center gap-2.5 group">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-200"
                            style={{
                                background: '#F0F2F5',
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.4), inset -2px -2px 5px rgba(255,255,255,0.85)',
                            }}
                        >
                            🏙️
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[#1A1D23] tracking-tight leading-none">CityPulse AI</div>
                            <div className="text-xs text-[#A8B0C0] mt-0.5">Citizen Portal</div>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
                    {navItems.map(group => (
                        <div key={group.section}>
                            <p className="px-3 text-[10px] font-bold text-[#C8D0DF] uppercase tracking-widest mb-1.5">
                                {group.section}
                            </p>
                            <div className="space-y-0.5">
                                {group.links.map(link => (
                                    <NavLink key={link.href} pathname={pathname} {...link} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-[#F0F2F5]">
                    <div className="flex items-center mb-3 px-1">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm uppercase text-[#4F6BED] shrink-0"
                            style={{
                                background: '#EEF1FD',
                                boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.3), inset -2px -2px 5px rgba(255,255,255,0.9)',
                            }}
                        >
                            {user?.name?.[0] || 'C'}
                        </div>
                        <div className="ml-2.5 overflow-hidden">
                            <p className="text-sm font-semibold text-[#1A1D23] truncate">{user?.name}</p>
                            <p className="text-xs text-[#A8B0C0] truncate">Citizen</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className={cn(
                            'w-full flex items-center justify-center px-3 py-2 rounded-xl',
                            'text-sm font-medium text-[#7B8494] gap-2',
                            'transition-all duration-200',
                            'hover:text-red-500 hover:bg-red-50',
                            'hover:shadow-[3px_3px_8px_rgba(163,177,198,0.4),_-3px_-3px_8px_rgba(255,255,255,0.85)]',
                            'active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.9)]',
                        )}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>

            {/* ── Mobile Header ─────────────────────────────────── */}
            <div
                className="md:hidden w-full fixed top-0 z-50 flex justify-between items-center px-4 py-3"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '0 2px 10px rgba(163,177,198,0.35)',
                    borderBottom: '1px solid rgba(255,255,255,0.8)',
                }}
            >
                <Link href="/app" className="flex items-center gap-2">
                    <span className="text-lg">🏙️</span>
                    <span className="font-bold text-sm text-[#1A1D23] tracking-tight">CityPulse AI</span>
                </Link>
                <div className="flex items-center gap-3">
                    <NotificationBell token={useAuthStore.getState().accessToken || undefined} />
                    <button
                        onClick={() => logout()}
                        className="p-2 rounded-xl text-[#7B8494] hover:text-red-500 transition-colors"
                        style={{ background: '#F0F2F5', boxShadow: '2px 2px 5px rgba(163,177,198,0.4), -2px -2px 5px rgba(255,255,255,0.85)' }}
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Main Content ──────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:mt-0 mt-14">

                {/* Desktop Top Header */}
                <header
                    className="hidden md:flex h-16 items-center justify-between px-8 shrink-0"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '0 2px 10px rgba(163,177,198,0.3)',
                        borderBottom: '1px solid rgba(255,255,255,0.8)',
                    }}
                >
                    <h2 className="text-sm font-semibold text-[#7B8494] flex items-center gap-2">
                        {currentCity ? (
                            <>
                                <span className="text-base">📍</span>
                                <span>{currentCity.name}, {currentCity.state}</span>
                            </>
                        ) : 'Global View'}
                    </h2>
                    <div className="flex items-center gap-4">
                        {currentCity && <CitySearchBox />}
                        <NotificationBell token={useAuthStore.getState().accessToken || undefined} />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
