'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 0.875rem',
    borderRadius: '0.75rem',
    background: '#F0F2F5',
    color: '#1A1D23',
    boxShadow: 'inset 2px 2px 6px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.9)',
    border: '1px solid rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
};

export default function AdminLoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login({ email: form.email, password: form.password });
            window.location.href = '/admin';
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
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
            <div className="w-full max-w-sm">

                {/* Logo / Brand */}
                <div className="text-center mb-10">
                    <div
                        className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 hover:scale-105"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '8px 8px 18px rgba(163,177,198,0.55), -8px -8px 18px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        <Shield className="w-8 h-8 text-[#4F6BED]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1A1D23] tracking-tight">Admin Portal</h1>
                    <p className="text-sm text-[#7B8494] mt-1">CityPulse AI — Administration</p>
                </div>

                {/* Card */}
                <div
                    className="rounded-3xl p-8"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '10px 10px 24px rgba(163,177,198,0.5), -10px -10px 24px rgba(255,255,255,0.92)',
                        border: '1px solid rgba(255,255,255,0.8)',
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl text-sm text-red-600 font-medium"
                                style={{
                                    background: 'rgba(239,68,68,0.07)',
                                    border: '1px solid rgba(239,68,68,0.15)',
                                }}
                            >
                                ⚠ {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#1A1D23]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                style={inputStyle}
                                placeholder="admin@smartcity.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-[#1A1D23]">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    style={{ ...inputStyle, paddingRight: '3rem' }}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8B0C0] hover:text-[#7B8494] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-2xl text-sm font-semibold text-[#4F6BED] transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: loading
                                    ? 'inset 4px 4px 10px rgba(163,177,198,0.5), inset -4px -4px 10px rgba(255,255,255,0.9)'
                                    : '6px 6px 14px rgba(163,177,198,0.55), -6px -6px 14px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-[#C8D0DF] mt-8">
                    Strictly authorized personnel only. All access is auditable.
                </p>
                <p className="text-center text-xs text-[#A8B0C0] mt-2">
                    Citizen?{' '}
                    <Link href="/login" className="text-[#4F6BED] hover:underline">
                        Login here →
                    </Link>
                </p>
            </div>
            </div>
        </div>
    );
}
