'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setCitizenAccessToken } from '../../services/api';
import { useAuthStore, AuthState } from '../../store/useAuthStore';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state: AuthState) => state.setAuth);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);
            const res = await api.post('/auth/citizen/login', formData);
            if (res.data.success) {
                const { user, accessToken } = res.data.data;
                setCitizenAccessToken(accessToken);
                setAuth(user, accessToken);
                router.push('/app');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login to SmartCity 360</h2>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.email} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.password} onChange={handleChange} required />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p className="text-sm text-center text-gray-600 mt-4">
                        Don&apos;t have an account? <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
