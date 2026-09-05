'use client';
import { useAuthStore } from '../../store/useAuthStore';

export default function AppHome() {
    const { user, currentCity } = useAuthStore();

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome back, {user?.name}</h1>
            <p className="text-gray-600">You are currently viewing services for <strong>{currentCity?.name}</strong>.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
                <div className="border border-gray-200 rounded p-4 text-center">
                    <div className="text-xl mb-2">💧</div>
                    <h3 className="font-semibold text-gray-700">Water Supply</h3>
                    <p className="text-sm text-gray-500">Coming soon in Phase 3</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                    <div className="text-xl mb-2">⚡</div>
                    <h3 className="font-semibold text-gray-700">Electricity</h3>
                    <p className="text-sm text-gray-500">Coming soon in Phase 3</p>
                </div>
                <div className="border border-gray-200 rounded p-4 text-center">
                    <div className="text-xl mb-2">🚦</div>
                    <h3 className="font-semibold text-gray-700">Traffic Watch</h3>
                    <p className="text-sm text-gray-500">Coming soon in Phase 3</p>
                </div>
            </div>
        </div>
    );
}
