import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiErrorResponse } from '@/types';

const API_BASE_URL =
    process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000';

/**
 * Axios instance configured for SmartCity 360 API.
 *
 * - Base URL set to backend API
 * - Auth header injection (stub — Phase 1 will populate from token store)
 * - Response interceptor to normalize error shape
 * - Request ID header for tracing
 */
export const api: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 30_000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor ─────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Phase 1: inject JWT from auth store
        // const token = authStore.getState().accessToken;
        // if (token) config.headers.Authorization = `Bearer ${token}`;

        // Add request ID for tracing
        config.headers['X-Client-Request-Id'] = crypto.randomUUID();

        return config;
    },
    (error: unknown) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        // Phase 1: handle 401 → refresh token → retry
        // if (error.response?.status === 401) { ... }

        return Promise.reject(error);
    }
);

// ── Service modules ─────────────────────────────────────────────

export const healthService = {
    check: () => api.get('/health').then((r) => r.data),
};

export const citiesService = {
    list: (params?: { page?: number; pageSize?: number }) =>
        api.get('/cities', { params }).then((r) => r.data),
    getById: (id: string) =>
        api.get(`/cities/${id}`).then((r) => r.data),
};

export default api;
