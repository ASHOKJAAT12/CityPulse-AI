'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { setCitizenAccessToken } from '../../services/api';
import { useAuthStore, AuthState } from '../../store/useAuthStore';

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
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/cities/active').then(res => {
            if (res.data.success) {
                setCities(res.data.data);
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
                password: formData.password
            });

            if (res.data.success) {
                const { user, accessToken } = res.data.data;
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join SmartCity 360</h2>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.name} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.email} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input type="text" name="mobile"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.mobile} onChange={handleChange} required pattern="[0-9]{10}" title="Must be a 10 digit number" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Your City</label>
                        <select name="cityId"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.cityId} onChange={handleChange} required>
                            <option value="" disabled>Select a city</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.password} onChange={handleChange} required minLength={8} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input type="password" name="confirmPassword"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <p className="text-sm text-center text-gray-600 mt-4">
                        Already have an account? <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
