'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';

export default function SettingsPage() {
    const { user, currentCity, setCity } = useAuthStore();

    // City Update state
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCityId, setSelectedCityId] = useState('');
    const [cityLoading, setCityLoading] = useState(false);
    const [cityMessage, setCityMessage] = useState('');

    // Auth Token tracking for future validation (but already extracted cleanly in hook)

    // Password Update state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState('');
    const [pwdError, setPwdError] = useState('');

    useEffect(() => {
        api.get('/cities/active').then(res => {
            if (res.data.success) {
                setCities(res.data.data);
            }
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (currentCity?.id) {
            setSelectedCityId(currentCity.id);
        } else if (user?.cityId) {
            setSelectedCityId(user.cityId);
        }
    }, [currentCity, user]);

    const handleCityChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setCityMessage('');
        setCityLoading(true);

        try {
            const res = await api.patch('/citizen/me/city', { cityId: selectedCityId });
            if (res.data.success) {
                setCity(res.data.data.city); // global auth store context update
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
        <div className="max-w-2xl mx-auto space-y-8">

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Current City</h2>

                {cityMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{cityMessage}</div>}

                <form onSubmit={handleCityChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select City</label>
                        <select
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)} required>
                            <option value="" disabled>Select your operational city</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">This affects which SmartCity services you&apos;re viewing.</p>
                    </div>

                    <button type="submit" disabled={cityLoading || selectedCityId === currentCity?.id}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                        {cityLoading ? 'Changing...' : 'Change City'}
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>

                {pwdMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{pwdMessage}</div>}
                {pwdError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{pwdError}</div>}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    <button type="submit" disabled={pwdLoading}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                        {pwdLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

        </div>
    );
}
