import { useState, useEffect } from 'react';
import api, { setTokens, clearTokens } from '../services/api';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    cityId: string | null;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
                try {
                    const res = await api.get('/admin/me');
                    if (res.data?.success) {
                        setUser(res.data.data);
                    }
                } catch (e) {
                    // API auto clears on failure from interceptor
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const login = async (credentials: any) => {
        const res = await api.post('/auth/admin/login', credentials);
        if (res.data?.success) {
            setTokens(res.data.data.tokens.accessToken, res.data.data.tokens.refreshToken);
            setUser(res.data.data.user);
            return res.data;
        }
        throw new Error('Login failed');
    };

    const logout = async () => {
        try {
            await api.post('/auth/admin/logout', { refreshToken: localStorage.getItem('refreshToken') });
        } catch (e) { }

        clearTokens();
        setUser(null);
        if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
        }
    };

    return { user, loading, login, logout };
}
