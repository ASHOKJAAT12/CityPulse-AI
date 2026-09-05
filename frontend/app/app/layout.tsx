'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { CitySearchBox } from '../../components/ui/CitySearchBox';

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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href="/app" className="font-extrabold text-indigo-700 text-xl tracking-tight flex items-center gap-2">
                            <span className="text-2xl">🏙️</span> SC 360
                        </Link>

                        {currentCity && <CitySearchBox className="hidden md:block" />}
                    </div>

                    <nav className="flex items-center space-x-6 text-sm font-semibold text-slate-600">
                        <Link href="/app" className={`hover:text-indigo-600 transition-colors ${pathname === '/app' ? 'text-indigo-700' : ''}`}>Dashboard</Link>
                        <Link href="/app/profile" className={`hover:text-indigo-600 transition-colors ${pathname === '/app/profile' ? 'text-indigo-700' : ''}`}>Profile</Link>
                        <Link href="/app/settings" className={`hover:text-indigo-600 transition-colors ${pathname === '/app/settings' ? 'text-indigo-700' : ''}`}>Settings</Link>
                        <button onClick={() => logout()} className="hover:text-rose-600 transition-colors">Logout</button>
                    </nav>
                </div>

                {/* Mobile City Context */}
                {currentCity && (
                    <div className="md:hidden px-4 py-2 border-t border-slate-100 bg-slate-50">
                        <CitySearchBox />
                    </div>
                )}
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
