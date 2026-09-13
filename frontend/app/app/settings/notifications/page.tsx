'use client';
import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useAuthStore } from '../../../../store/useAuthStore';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Preference {
    category: string;
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    criticalOverride: boolean;
}

const CATEGORIES = ['WATER', 'ELECTRICITY', 'TRAFFIC', 'EV', 'STREETLIGHT', 'GARBAGE', 'CITIZEN_REPORT', 'SYSTEM'];

export default function NotificationPreferencesSettings() {
    const { accessToken } = useAuthStore();
    const [preferences, setPreferences] = useState<Record<string, Preference>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!accessToken) return;

        const fetchPreferences = async () => {
            try {
                const res = await api.get('/notifications/preferences', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (res.data?.success) {
                    const mapped: Record<string, Preference> = {};
                    res.data.data.forEach((p: Preference) => {
                        mapped[p.category] = p;
                    });
                    setPreferences(mapped);
                }
            } catch (error) {
                toast.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [accessToken]);

    const handleToggle = (category: string, field: keyof Preference) => {
        setPreferences(prev => {
            const existing = prev[category] || {
                category,
                inApp: true,
                email: false,
                sms: false,
                push: false,
                criticalOverride: true
            };

            return {
                ...prev,
                [category]: {
                    ...existing,
                    [field]: !existing[field]
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises = Object.values(preferences).map(pref =>
                api.post('/notifications/preferences', pref, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
                ));

            await Promise.all(promises);
            toast.success('Notification preferences saved');
        } catch (error) {
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Link href="/app/settings" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
            </Link>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Notification Preferences</h1>
                    <p className="text-slate-500 text-sm mt-1">Control how and when you want to receive alerts for different city services.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow disabled:opacity-50 hover:bg-indigo-700 flex items-center transition"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex text-sm text-blue-800">
                <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500" />
                <p>
                    <strong>Critical Emergency Override:</strong> Important life-safety or critical utility failure notifications will bypass your mute preferences unless explicitly disabled.
                </p>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Service Category</th>
                            <th className="px-6 py-4 text-center">In-App</th>
                            <th className="px-6 py-4 text-center text-slate-400">Email (Coming Soon)</th>
                            <th className="px-6 py-4 text-center">Critical Override</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {CATEGORIES.map(category => {
                            const pref = preferences[category] || { inApp: true, email: false, sms: false, push: false, criticalOverride: true };

                            return (
                                <tr key={category} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-700 flex items-center">
                                            {category.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={pref.inApp}
                                                onChange={() => handleToggle(category, 'inApp')}
                                                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center opacity-50 pointer-events-none">
                                            <input
                                                type="checkbox"
                                                checked={false}
                                                readOnly
                                                className="w-5 h-5 text-indigo-600 rounded border-slate-300"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center group relative">
                                            <input
                                                type="checkbox"
                                                checked={pref.criticalOverride}
                                                onChange={() => handleToggle(category, 'criticalOverride')}
                                                className="w-5 h-5 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-end">
                <p className="text-xs text-slate-400 flex items-center">
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    CityPulse AI respects your right to disconnect.
                </p>
            </div>
        </div>
    );
}
