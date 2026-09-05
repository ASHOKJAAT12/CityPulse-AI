'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';

export default function ProfilePage() {
    const { user, setAuth, accessToken } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setMobile(user.mobile || '');
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await api.patch('/citizen/me', { name, mobile });
            if (res.data.success) {
                setMessage('Profile updated successfully');
                setAuth({ ...user!, name, mobile }, accessToken || '');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>

            {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Read only)</label>
                    <input type="email" readOnly value={user?.email || ''}
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input type="text" readOnly value={user?.role || ''}
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed focus:outline-none" />
                </div>
                <hr className="my-4 border-gray-200" />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} required pattern="[0-9]{10}"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={loading}
                        className="w-full sm:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}
