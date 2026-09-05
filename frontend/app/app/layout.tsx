'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading, currentCity, checkSession, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/app" className="font-bold text-indigo-600 text-xl">SmartCity 360</Link>
                        {currentCity && (
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1 cursor-pointer" onClick={() => router.push('/app/settings')}>
                                📍 {currentCity.name}
                            </span>
                        )}
                    </div>
                    <nav className="flex space-x-6 text-sm font-medium text-gray-700">
                        <Link href="/app" className="hover:text-indigo-600">Home</Link>
                        <Link href="/app/profile" className="hover:text-indigo-600">Profile</Link>
                        <Link href="/app/settings" className="hover:text-indigo-600">Settings</Link>
                        <button onClick={() => logout()} className="hover:text-red-600">Logout</button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
