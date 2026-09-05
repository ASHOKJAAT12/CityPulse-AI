import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // needed for sending/receiving HttpOnly cookies for Citizen
});

// Admin still uses LocalStorage as per Phase 1
export const getAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

export const getRefreshToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refreshToken');
    }
    return null;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
};

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

// We will inject the Citizen Token dynamically via a helper, 
// because we don't want to store it in localStorage.
let citizenAccessToken: string | null = null;
export const setCitizenAccessToken = (token: string | null) => {
    citizenAccessToken = token;
};

// Request interceptor placing token intelligently
api.interceptors.request.use(
    (config) => {
        // If it's a citizen route, apply the citizen in-memory token
        // Let's assume all /citizen routes and non-/admin routes belong to Citizen
        // You could also refine it based on a unified auth logic

        const isCitizenCall =
            config.url?.startsWith('/citizen') ||
            config.url?.includes('auth/citizen');

        if (isCitizenCall) {
            if (citizenAccessToken && config.headers) {
                config.headers.Authorization = `Bearer ${citizenAccessToken}`;
            }
        } else {
            // Probably Admin call
            const token = getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor silently renewing session if dead
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Return immediately if it's hitting auth endpoints
        if (originalRequest.url?.includes('/auth/')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;

            // Check context - is it an Admin call or Citizen call?
            const isCitizenCall =
                originalRequest.url?.startsWith('/citizen');

            if (isCitizenCall) {
                // Citizen Flow: Refresh token is in HttpOnly cookie, we just call the API
                try {
                    const { data } = await axios.post(`${api.defaults.baseURL}/auth/citizen/refresh`, {}, {
                        withCredentials: true
                    });

                    if (data.success && data.data?.accessToken) {
                        setCitizenAccessToken(data.data.accessToken);
                        // Zustand store updating relies on its own logic or we inject it similarly
                        // Update original header
                        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                        return api(originalRequest);
                    }
                } catch (err) {
                    setCitizenAccessToken(null);
                    if (typeof window !== 'undefined') {
                        // Let React components handle redirection via Zustand loading state or here:
                        window.location.href = '/login';
                    }
                    return Promise.reject(err);
                }
            } else {
                // Admin Flow (Phase 1 logic retained)
                try {
                    const refreshToken = getRefreshToken();
                    if (!refreshToken) throw new Error('No refresh token exists');

                    const { data } = await axios.post(`${api.defaults.baseURL}/auth/admin/refresh`, {
                        refreshToken
                    });

                    if (data.success && data.data) {
                        setTokens(data.data.accessToken, data.data.refreshToken);
                        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                        return api(originalRequest);
                    }
                } catch (err) {
                    clearTokens();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/admin/login';
                    }
                    return Promise.reject(err);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
