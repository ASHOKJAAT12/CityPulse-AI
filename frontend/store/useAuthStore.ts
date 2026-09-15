import { create } from 'zustand';
import api, { setCitizenAccessToken } from '../services/api';

export type UserRole = 'SUPER_ADMIN' | 'CITY_ADMIN' | 'CITIZEN';

export interface User {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: UserRole;
    cityId?: string | null;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    currentCity: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setAuth: (user: User, token: string) => void;
    setCity: (city: any) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

let sessionRefreshPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    currentCity: null,
    isAuthenticated: false,
    isLoading: true, // starts loading to allow initial silent refresh

    setAuth: (user, token) => {
        console.log('[AuthStore] setAuth: user authenticated', { userId: user.id });
        set({
            user,
            accessToken: token,
            currentCity: (user as any).city || null,
            isAuthenticated: true,
            isLoading: false
        });
    },

    setCity: (city) => set({
        currentCity: city
    }),

    logout: async () => {
        try {
            const fallbackToken = typeof window !== 'undefined' ? localStorage.getItem('citizenRefreshToken') : null;
            const payload = fallbackToken ? { refreshToken: fallbackToken } : {};
            console.log('[AuthStore] logout: initiating logout', { hasFallbackToken: !!fallbackToken });
            await api.post('/auth/citizen/logout', payload);
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            console.log('[AuthStore] logout: clearing local storage and state');
            if (typeof window !== 'undefined') localStorage.removeItem('citizenRefreshToken');
            set({ user: null, accessToken: null, currentCity: null, isAuthenticated: false, isLoading: false });
        }
    },

    checkSession: async () => {
        if (get().isAuthenticated && get().accessToken) return;

        if (sessionRefreshPromise) {
            await sessionRefreshPromise;
            return;
        }

        sessionRefreshPromise = (async () => {
            try {
                const fallbackToken = typeof window !== 'undefined' ? localStorage.getItem('citizenRefreshToken') : null;
                const payload = fallbackToken ? { refreshToken: fallbackToken } : {};
                // Attempt to silently refresh token (relies on HttpOnly cookie, but fallback is sent just in case)
                const { data } = await api.post('/auth/citizen/refresh', payload);
                if (data?.success && data?.data?.accessToken) {
                    // If successful, we got the new access token. Now we need user profile.
                    const token = data.data.accessToken;
                    if (data.data.refreshToken && typeof window !== 'undefined') {
                        localStorage.setItem('citizenRefreshToken', data.data.refreshToken);
                    }
                    // Update Axios interceptor memory state
                    setCitizenAccessToken(token);
                    // Temporarily set token in api instance so profile fetch works
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    const profileRes = await api.get('/citizen/me');
                    if (profileRes.data?.success) {
                        const userData = profileRes.data.data;
                        set({
                            user: userData,
                            accessToken: token,
                            currentCity: userData.city || null,
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return;
                    }
                }
            } catch (e) {
                console.log('No active citizen session found');
            }

            set({ user: null, accessToken: null, currentCity: null, isAuthenticated: false, isLoading: false });
        })();

        try {
            await sessionRefreshPromise;
        } finally {
            sessionRefreshPromise = null;
        }
    }
}));
