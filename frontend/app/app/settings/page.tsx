'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import Link from 'next/link';

const inputStyle: React.CSSProperties = {
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

const selectStyle: React.CSSProperties = {
    ...{
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
        appearance: 'none' as any,
        WebkitAppearance: 'none',
        cursor: 'pointer',
    },
};

const btnStyle = (loading = false): React.CSSProperties => ({
    padding: '0.625rem 1.25rem',
    borderRadius: '0.75rem',
    background: '#FFFFFF',
    color: '#4F6BED',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    border: '1px solid rgba(255,255,255,0.8)',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    boxShadow: loading
        ? 'inset 3px 3px 8px rgba(163,177,198,0.45), inset -3px -3px 8px rgba(255,255,255,0.9)'
        : '5px 5px 12px rgba(163,177,198,0.55), -5px -5px 12px rgba(255,255,255,0.92)',
    transition: 'all 0.2s ease',
    outline: 'none',
});

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="rounded-2xl p-6"
            style={{
                background: '#FFFFFF',
                boxShadow: '6px 6px 14px rgba(163,177,198,0.5), -6px -6px 14px rgba(255,255,255,0.92)',
                border: '1px solid rgba(255,255,255,0.8)',
            }}
        >
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const { user, currentCity, setCity } = useAuthStore();

    const [cities, setCities] = useState<any[]>([]);
    const [selectedCityId, setSelectedCityId] = useState('');
    const [cityLoading, setCityLoading] = useState(false);
    const [cityMessage, setCityMessage] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState('');
    const [pwdError, setPwdError] = useState('');

    useEffect(() => {
        api.get('/cities/active').then(res => {
            if (res.data.success) setCities(res.data.data);
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (currentCity?.id) setSelectedCityId(currentCity.id);
        else if (user?.cityId) setSelectedCityId(user.cityId);
    }, [currentCity, user]);

    const handleCityChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setCityMessage('');
        setCityLoading(true);
        try {
            const res = await api.patch('/citizen/me/city', { cityId: selectedCityId });
            if (res.data.success) {
                setCity(res.data.data.city);
                setCityMessage('City changed successfully');
            }
        } catch (err: any) {
            setCityMessage(err.response?.data?.message || 'City update failed');
        } finally {
            setCityLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdMessage('');
        setPwdError('');
        setPwdLoading(true);
        try {
            const res = await api.patch('/citizen/me/password', { currentPassword, newPassword });
            if (res.data.success) {
                setPwdMessage('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
            }
        } catch (err: any) {
            setPwdError(err.response?.data?.message || 'Password update failed');
        } finally {
            setPwdLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Page Title */}
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-[#1A1D23] tracking-tight">Settings</h1>
                <p className="text-sm text-[#7B8494] mt-1">Manage your account and preferences</p>
            </div>

            {/* ── Current City ── */}
            <SectionCard>
                <h2 className="text-base font-bold text-[#1A1D23] mb-1">Current City</h2>
                <p className="text-sm text-[#7B8494] mb-5">
                    Your active city determines which SmartCity services you&apos;re viewing.
                </p>

                {cityMessage && (
                    <div
                        className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                        style={{
                            background: cityMessage.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.07)',
                            color: cityMessage.includes('success') ? '#16a34a' : '#dc2626',
                            border: cityMessage.includes('success') ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.15)',
                        }}
                    >
                        {cityMessage.includes('success') ? '✓' : '⚠'} {cityMessage}
                    </div>
                )}

                <form onSubmit={handleCityChange} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Select City</label>
                        <div className="relative">
                            <select
                                style={selectStyle}
                                value={selectedCityId}
                                onChange={(e) => setSelectedCityId(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select your operational city</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B0C0] pointer-events-none text-xs">▾</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cityLoading || selectedCityId === currentCity?.id}
                        style={btnStyle(cityLoading || selectedCityId === currentCity?.id)}
                    >
                        {cityLoading ? 'Changing...' : 'Change City'}
                    </button>
                </form>
            </SectionCard>

            {/* ── Change Password ── */}
            <SectionCard>
                <h2 className="text-base font-bold text-[#1A1D23] mb-1">Change Password</h2>
                <p className="text-sm text-[#7B8494] mb-5">Keep your account secure with a strong password.</p>

                {pwdMessage && (
                    <div
                        className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                        style={{
                            background: 'rgba(34,197,94,0.08)',
                            color: '#16a34a',
                            border: '1px solid rgba(34,197,94,0.2)',
                        }}
                    >
                        ✓ {pwdMessage}
                    </div>
                )}
                {pwdError && (
                    <div
                        className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                        style={{
                            background: 'rgba(239,68,68,0.07)',
                            color: '#dc2626',
                            border: '1px solid rgba(239,68,68,0.15)',
                        }}
                    >
                        ⚠ {pwdError}
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">Current Password</label>
                        <input
                            type="password"
                            style={inputStyle}
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[#1A1D23]">New Password</label>
                        <input
                            type="password"
                            style={inputStyle}
                            placeholder="Min. 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={pwdLoading}
                        style={btnStyle(pwdLoading)}
                    >
                        {pwdLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </SectionCard>

            {/* ── Notification Preferences ── */}
            <SectionCard>
                <div className="flex items-center justify-between gap-6">
                    <div>
                        <h2 className="text-base font-bold text-[#1A1D23] mb-1">Notification Preferences</h2>
                        <p className="text-sm text-[#7B8494]">
                            Manage how you receive alerts and updates across city services.
                        </p>
                    </div>
                    <Link
                        href="/app/settings/notifications"
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-[#4F6BED] transition-all duration-200"
                        style={{
                            background: '#FFFFFF',
                            boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.92)',
                            border: '1px solid rgba(255,255,255,0.8)',
                        }}
                    >
                        Configure →
                    </Link>
                </div>
            </SectionCard>

        </div>
    );
}
