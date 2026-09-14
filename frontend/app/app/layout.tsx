'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { CitySearchBox } from '../../components/ui/CitySearchBox';
import { NotificationBell } from '../../components/ui/NotificationBell';
import {
    LogOut, LayoutDashboard, User, Settings as SettingsIcon,
    Droplet, Zap, Navigation, Battery, Lightbulb, Trash2, Option, Edit3, ClipboardList
} from 'lucide-react';

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
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium tracking-wide">Loading SmartCity Context...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white shadow-xl flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-700/50">
                    <Link href="/app" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight flex items-center gap-2">
                        <span className="text-2xl">🏙️</span> SC 360
                    </Link>
                    <p className="text-slate-400 text-sm mt-1">Citizen Portal</p>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Main</p>
                    <Link href="/app" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname === '/app' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard className="w-5 h-5 mr-3 opacity-70" /> Dashboard
                    </Link>

                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">City Services</p>
                    <Link href="/city/water" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/water') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Droplet className="w-5 h-5 mr-3 opacity-70" /> Water System
                    </Link>
                    <Link href="/city/electricity" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/electricity') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Zap className="w-5 h-5 mr-3 opacity-70" /> Power Grid
                    </Link>
                    <Link href="/city/traffic" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/traffic') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Navigation className="w-5 h-5 mr-3 opacity-70" /> Traffic Monitor
                    </Link>
                    <Link href="/city/ev" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/ev') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Battery className="w-5 h-5 mr-3 opacity-70" /> EV Stations
                    </Link>
                    <Link href="/city/streetlights" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/streetlights') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Lightbulb className="w-5 h-5 mr-3 opacity-70" /> Street Lights
                    </Link>
                    <Link href="/city/garbage" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname.includes('/garbage') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Trash2 className="w-5 h-5 mr-3 opacity-70" /> Waste Mgmt
                    </Link>

                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Incident Reporting</p>
                    <Link href="/city/report" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname === '/city/report' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Edit3 className="w-5 h-5 mr-3 opacity-70" /> Report Issue
                    </Link>
                    <Link href="/city/my-reports" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname === '/city/my-reports' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <ClipboardList className="w-5 h-5 mr-3 opacity-70" /> My Reports
                    </Link>

                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Account</p>
                    <Link href="/app/profile" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname === '/app/profile' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <User className="w-5 h-5 mr-3 opacity-70" /> Profile
                    </Link>
                    <Link href="/app/settings" className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${pathname === '/app/settings' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <SettingsIcon className="w-5 h-5 mr-3 opacity-70" /> Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center mb-4 px-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm uppercase">
                            {user?.name?.[0] || 'C'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">Citizen</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Log out
                    </button>
                </div>
            </div>

            {/* Mobile Header (Fallback) */}
            <div className="md:hidden w-full bg-slate-900 text-white p-4 flex justify-between items-center fixed top-0 z-50">
                <Link href="/app" className="font-bold tracking-tight">SC 360</Link>
                <div className="flex gap-4">
                    <NotificationBell token={useAuthStore.getState().accessToken || undefined} />
                    <button onClick={() => logout()}><LogOut className="w-5 h-5 text-slate-300" /></button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden md:mt-0 mt-14">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10 hidden md:flex">
                    <h2 className="text-slate-800 font-semibold flex items-center gap-4">
                        {currentCity ? <span>📍 {currentCity.name}, {currentCity.state}</span> : 'Global View'}
                    </h2>
                    <div className="flex items-center space-x-6">
                        {currentCity && <CitySearchBox />}
                        <NotificationBell token={useAuthStore.getState().accessToken || undefined} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
