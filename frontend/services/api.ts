import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

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

// Request interceptor placing token blindly
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
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
        return Promise.reject(error);
    }
);

export default api;
