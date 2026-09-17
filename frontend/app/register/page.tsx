'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setCitizenAccessToken } from '../../services/api';
import { useAuthStore, AuthState } from '../../store/useAuthStore';
import { Navbar } from '@/components/ui/Navbar';

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.75rem',
    background: '#F0F2F5',
    color: '#1A1D23',
    boxShadow: 'inset 2px 2px 6px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.9)',
    border: '1px solid rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    WebkitAppearance: 'none',
    appearance: 'none' as any,
    cursor: 'pointer',
};

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state: AuthState) => state.setAuth);

    const [cities, setCities] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        cityId: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/cities/active').then(res => {
            if (res.data.success) {
                const activeCities = res.data.data;
                setCities(activeCities);
                if (activeCities.length === 1) {
                    setFormData(prev => ({ ...prev, cityId: activeCities[0].id || activeCities[0]._id }));
                }
            }
        }).catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/auth/citizen/register', {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                cityId: formData.cityId,
                password: formData.password,
            });

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
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        borderRadius: '0.75rem',
        background: '#F0F2F5',
        color: '#1A1D23',
        boxShadow: 'inset 2px 2px 6px rgba(163,177,198,0.45), inset -2px -2px 6px rgba(255,255,255,0.9)',
        border: '1px solid rgba(255,255,255,0.7)',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        outline: 'none',
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
                className="w-full max-w-md rounded-3xl p-8"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '10px 10px 24px rgba(163,177,198,0.5), -10px -10px 24px rgba(255,255,255,0.92)',
                    border: '1px solid rgba(255,255,255,0.8)',
                }}
            >
                <div className="mb-7 text-center">
                    <h1 className="text-xl font-bold text-[#1A1D23]">Create your account</h1>
                    <p className="text-sm text-[#7B8494] mt-1">Join CityPulse AI — your smart city portal</p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="mb-5 px-4 py-3 rounded-xl text-sm text-red-600 font-medium"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
                    >
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Full Name</label>
                        <input type="text" name="name" style={fieldStyle} placeholder="John Smith"
                            value={formData.name} onChange={handleChange} required />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Email Address</label>
                        <input type="email" name="email" style={fieldStyle} placeholder="you@example.com"
                            value={formData.email} onChange={handleChange} required />
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Mobile Number</label>
                        <input type="text" name="mobile" style={fieldStyle} placeholder="10-digit number"
                            value={formData.mobile} onChange={handleChange} required pattern="[0-9]{10}" title="Must be a 10 digit number" />
                    </div>

                    {/* City Select */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Select Your City</label>
                        <div className="relative">
                            <select name="cityId" style={selectStyle} value={formData.cityId} onChange={handleChange} required>
                                <option value="" disabled>Select a city</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B0C0] pointer-events-none text-xs">▾</span>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Password</label>
                        <input type="password" name="password" style={fieldStyle} placeholder="Min. 8 characters"
                            value={formData.password} onChange={handleChange} required minLength={8} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Confirm Password</label>
                        <input type="password" name="confirmPassword" style={fieldStyle} placeholder="Repeat password"
                            value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
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
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                    <p className="text-sm text-center text-[#A8B0C0] pt-1">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#4F6BED] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
            </div>
        </div>
    );
}
