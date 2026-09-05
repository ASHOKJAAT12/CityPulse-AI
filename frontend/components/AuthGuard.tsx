'use client';
import { useAuth } from '../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Map, Users, Shield, Truck } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (!loading && !user && !isLoginPage) {
            router.push('/admin/login');
        }
        if (!loading && user && isLoginPage) {
            router.push('/admin');
        }
    }, [user, loading, isLoginPage, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!user) {
        return <>{children}</>;
    }

    if (isLoginPage) return <>{children}</>;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white shadow-xl flex flex-col">
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">SmartCity 360</h1>
                    <p className="text-slate-400 text-sm mt-1">Admin Portal</p>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1">
                    <Link href="/admin" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <Shield className="w-5 h-5 mr-3 opacity-70" /> Dashboard
                    </Link>

                    <Link href="/admin/garbage" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <Truck className="w-5 h-5 mr-3 opacity-70" /> Garbage Ops
                    </Link>

                    {user.role === 'SUPER_ADMIN' && (
                        <>
                            <Link href="/admin/cities" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                                <Map className="w-5 h-5 mr-3 opacity-70" /> Cities
                            </Link>
                            <Link href="/admin/city-admins" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                                <Users className="w-5 h-5 mr-3 opacity-70" /> City Admins
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-center mb-4 px-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm uppercase">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.role}</p>
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
                    <h2 className="text-slate-800 font-semibold">{user.role === 'CITY_ADMIN' && user.cityId ? 'City Admin Zone' : 'Global Platform Control'}</h2>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
