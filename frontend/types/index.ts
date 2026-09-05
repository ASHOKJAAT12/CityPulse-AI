/**
 * Shared TypeScript types for SmartCity 360 frontend.
 * These mirror the backend Prisma models and API response shapes.
 */

// ── API Response Types ─────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    error: {
        code: string;
        details?: unknown;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// ── Role Types ─────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'CITY_ADMIN' | 'CITIZEN';
export type CityStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

// ── Entity Types ───────────────────────────────────────────────

export interface City {
    id: string;
    name: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    status: CityStatus;
    description?: string;
    logoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role: Role;
    status: UserStatus;
    cityId?: string;
    city?: City;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ── Geospatial Types ───────────────────────────────────────────

export interface LatLng {
    lat: number;
    lng: number;
}

export interface GeoPoint extends LatLng {
    address?: string;
}

export interface GeoBounds {
    northEast: LatLng;
    southWest: LatLng;
}

// ── Health Check ───────────────────────────────────────────────

export interface HealthStatus {
    status: 'ok' | 'degraded';
    version: string;
    phase: string;
    timestamp: string;
    uptime: string;
    database: {
        status: 'connected' | 'disconnected' | 'error';
        latencyMs: number | null;
    };
    latencyMs: number;
}

// ── Component Prop Helpers ────────────────────────────────────

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

// ── Form Types ────────────────────────────────────────────────

export interface SelectOption<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
}
