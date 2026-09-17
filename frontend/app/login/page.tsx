'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setCitizenAccessToken } from '../../services/api';
import { useAuthStore, AuthState } from '../../store/useAuthStore';
import { Navbar } from '@/components/ui/Navbar';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state: AuthState) => state.setAuth);

    const [formData, setFormData] = useState({ email: '', password: '' });
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
                const { user, accessToken, refreshToken } = res.data.data;
                if (typeof window !== 'undefined' && refreshToken) {
                    localStorage.setItem('citizenRefreshToken', refreshToken);
                }
                setCitizenAccessToken(accessToken);
                setAuth(user, accessToken);
                router.push('/app');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: '#F0F2F5' }}
        >
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center p-6 py-10">

            {/* Card */}
            <div
                className="w-full max-w-sm rounded-3xl p-8"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '10px 10px 24px rgba(163,177,198,0.5), -10px -10px 24px rgba(255,255,255,0.92)',
                    border: '1px solid rgba(255,255,255,0.8)',
                }}
            >
                <div className="mb-7 text-center">
                    <h1 className="text-xl font-bold text-[#1A1D23]">Welcome back</h1>
                    <p className="text-sm text-[#7B8494] mt-1">Sign in to your citizen account</p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 font-medium"
                        style={{
                            background: 'rgba(239,68,68,0.07)',
                            border: '1px solid rgba(239,68,68,0.15)',
                        }}
                    >
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            className="input-base"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="input-base"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-2xl text-sm font-semibold text-[#4F6BED] transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: loading
                                ? 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -4px -4px 10px rgba(255,255,255,0.9)'
                                : '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p className="text-sm text-center text-[#A8B0C0] pt-1">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-[#4F6BED] font-semibold hover:underline">
                            Register
                        </Link>
                    </p>
                </form>
            </div>

            {/* Admin link */}
            <p className="mt-8 text-xs text-[#C8D0DF]">
                Admin?{' '}
                <Link href="/admin/login" className="text-[#7B8494] hover:text-[#4F6BED] transition-colors">
                    Access Admin Portal →
                </Link>
            </p>
            </div>
        </div>
    );
}
