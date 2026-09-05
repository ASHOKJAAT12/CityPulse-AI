import { create } from 'zustand';
import api from '../services/api';

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

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    currentCity: null,
    isAuthenticated: false,
    isLoading: true, // starts loading to allow initial silent refresh

    setAuth: (user, token) => set({
        user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false
    }),

    setCity: (city) => set({
        currentCity: city
    }),

    logout: async () => {
        try {
            await api.post('/auth/citizen/logout');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            set({ user: null, accessToken: null, currentCity: null, isAuthenticated: false, isLoading: false });
        }
    },

    checkSession: async () => {
        try {
            // Attempt to silently refresh token (relies on HttpOnly cookie)
            const { data } = await api.post('/auth/citizen/refresh');
            if (data?.success && data?.data?.accessToken) {
                // If successful, we got the new access token. Now we need user profile.
                const token = data.data.accessToken;
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
    }
}));
