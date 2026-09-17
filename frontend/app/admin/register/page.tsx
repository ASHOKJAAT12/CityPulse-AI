'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Building2, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';
import api from '../../../services/api';

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

export default function AdminRegisterPage() {
    const [cities, setCities] = useState<any[]>([]);
    const [form, setForm] = useState({
        name: '',
        email: '',
        department: 'WATER',
        cityId: '',
        phone: '',
        justification: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/cities/active')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    setCities(res.data.data);
                    if (res.data.data.length > 0) {
                        setForm((prev) => ({ ...prev, cityId: res.data.data[0].id || res.data.data[0]._id }));
                    }
                }
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate registration/access request submission
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1200);
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F0F2F5' }}>
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center p-6 py-10">
                <div className="w-full max-w-md">
                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <div
                            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-105"
                            style={{
                                background: '#FFFFFF',
                                boxShadow: '6px 6px 16px rgba(163,177,198,0.5), -6px -6px 16px rgba(255,255,255,0.92)',
                                border: '1px solid rgba(255,255,255,0.8)',
                            }}
                        >
                            <Shield className="w-7 h-7 text-[#4F6BED]" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#1A1D23] tracking-tight">Municipal Access Request</h1>
                        <p className="text-xs sm:text-sm text-[#7B8494] mt-1">
                            City Administrator & Departmental Onboarding
                        </p>
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
                        {submitted ? (
                            <div className="text-center py-6 space-y-4">
                                <div
                                    className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-emerald-600"
                                    style={{
                                        background: 'rgba(34,197,94,0.1)',
                                    }}
                                >
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-lg font-bold text-[#1A1D23]">Access Request Submitted</h2>
                                <p className="text-xs sm:text-sm text-[#7B8494] leading-relaxed">
                                    Your municipal credentials request has been forwarded to the Super Admin. You will receive
                                    your verified access keys via your registered municipal email.
                                </p>
                                <div className="pt-4">
                                    <Link
                                        href="/admin/login"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                            boxShadow: '4px 4px 12px rgba(79,107,237,0.35)',
                                        }}
                                    >
                                        <span>Return to Admin Login</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-3 rounded-xl text-xs text-[#4F6BED] font-medium leading-relaxed"
                                    style={{
                                        background: 'rgba(79,107,237,0.06)',
                                        border: '1px solid rgba(79,107,237,0.15)',
                                    }}
                                >
                                    ℹ Municipal administrator accounts are verified and provisioned per department guidelines.
                                </div>

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1D23]">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        style={inputStyle}
                                        placeholder="Officer Jane Doe"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>

                                {/* Official Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1D23]">
                                        Official Municipal Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        style={inputStyle}
                                        placeholder="jane.doe@city.gov"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>

                                {/* Department */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1D23]">
                                        Department
                                    </label>
                                    <select
                                        style={inputStyle}
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    >
                                        <option value="WATER">Water Management</option>
                                        <option value="ELECTRICITY">Electricity & Energy</option>
                                        <option value="TRAFFIC">Traffic & Mobility</option>
                                        <option value="GARBAGE">Waste & Sanitation</option>
                                        <option value="STREETLIGHTS">Smart Streetlights</option>
                                        <option value="EMERGENCY">Emergency Operations</option>
                                        <option value="MUNICIPAL_ALL">General Administration</option>
                                    </select>
                                </div>

                                {/* City */}
                                {cities.length > 0 && (
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1D23]">
                                            Assigned City
                                        </label>
                                        <select
                                            style={inputStyle}
                                            value={form.cityId}
                                            onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                                        >
                                            {cities.map((city: any) => (
                                                <option key={city.id || city._id} value={city.id || city._id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-200 mt-3 flex items-center justify-center gap-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #4F6BED 0%, #3D56D5 100%)',
                                        boxShadow: '4px 4px 14px rgba(79,107,237,0.35)',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Submitting Request...</span>
                                        </>
                                    ) : (
                                        <span>Request Admin Credentials</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <p className="text-center text-xs text-[#A8B0C0] mt-6">
                        Already have credentials?{' '}
                        <Link href="/admin/login" className="text-[#4F6BED] font-semibold hover:underline">
                            Sign in to Admin Portal →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
