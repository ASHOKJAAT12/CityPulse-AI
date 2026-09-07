import api from './api';
import { ApiResponse } from '../types';
import { Driver, GarbageVehicle, GarbageRoute, GarbageRouteStop } from '../types/garbage.types';

export const garbageService = {
    // --- DRIVERS ---
    getDrivers: async (params?: Record<string, any>) => {
        const response = await api.get<any>('/garbage/drivers', { params });
        return response.data as any;
    },
    createDriver: async (data: Partial<Driver>) => {
        const response = await api.post<ApiResponse<Driver>>('/garbage/drivers', data);
        return response.data as any;
    },
    updateDriver: async (id: string, data: Partial<Driver>) => {
        const response = await api.patch<ApiResponse<Driver>>(`/garbage/drivers/${id}`, data);
        return response.data as any;
    },

    // --- VEHICLES ---
    getVehicles: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponse<GarbageVehicle[]>>('/garbage/vehicles', { params });
        return response.data as any;
    },
    createVehicle: async (data: Partial<GarbageVehicle>) => {
        const response = await api.post<ApiResponse<GarbageVehicle>>('/garbage/vehicles', data);
        return response.data as any;
    },
    updateVehicle: async (id: string, data: Partial<GarbageVehicle>) => {
        const response = await api.patch<ApiResponse<GarbageVehicle>>(`/garbage/vehicles/${id}`, data);
        return response.data as any;
    },

    // --- ROUTES ---
    getRoutes: async (params?: Record<string, any>) => {
        const response = await api.get<ApiResponse<GarbageRoute[]>>('/garbage/routes', { params });
        return response.data as any;
    },
    getRouteById: async (id: string) => {
        const response = await api.get<ApiResponse<GarbageRoute>>(`/garbage/routes/${id}`);
        return response.data as any;
    },
    createRoute: async (data: Partial<GarbageRoute>) => {
        const response = await api.post<ApiResponse<GarbageRoute>>('/garbage/routes', data);
        return response.data as any;
    },
    updateRoute: async (id: string, data: Partial<GarbageRoute>) => {
        const response = await api.patch<ApiResponse<GarbageRoute>>(`/garbage/routes/${id}`, data);
        return response.data as any;
    },
    activateRoute: async (id: string) => {
        const response = await api.post<ApiResponse<GarbageRoute>>(`/garbage/routes/${id}/activate`);
        return response.data as any;
    },
    deactivateRoute: async (id: string) => {
        const response = await api.post<ApiResponse<GarbageRoute>>(`/garbage/routes/${id}/deactivate`);
        return response.data as any;
    },

    // --- STOPS ---
    getStops: async (routeId: string) => {
        const response = await api.get<ApiResponse<GarbageRouteStop[]>>(`/garbage/routes/${routeId}/stops`);
        return response.data as any;
    },
    addStop: async (routeId: string, data: Partial<GarbageRouteStop>) => {
        const response = await api.post<ApiResponse<GarbageRouteStop>>(`/garbage/routes/${routeId}/stops`, data);
        return response.data;
    },
    updateStop: async (routeId: string, stopId: string, data: Partial<GarbageRouteStop>) => {
        const response = await api.patch<ApiResponse<GarbageRouteStop>>(`/garbage/routes/${routeId}/stops/${stopId}`, data);
        return response.data;
    },
    removeStop: async (routeId: string, stopId: string) => {
        const response = await api.delete<ApiResponse<null>>(`/garbage/routes/${routeId}/stops/${stopId}`);
        return response.data;
    },

    // --- PHASE 5: TRACKING ---
    startTracking: async (vehicleId: string, routeId: string) => {
        const response = await api.post<any>(`/garbage/vehicles/${vehicleId}/tracking/start`, { routeId });
        return response.data as any;
    },
    stopTracking: async (vehicleId: string) => {
        const response = await api.post<any>(`/garbage/vehicles/${vehicleId}/tracking/stop`);
        return response.data as any;
    },
    getTrackingStatus: async (vehicleId: string) => {
        const response = await api.get<any>(`/garbage/vehicles/${vehicleId}/tracking`);
        return response.data as any;
    },
    getLocationHistory: async (vehicleId: string, params?: Record<string, any>) => {
        const response = await api.get<any>(`/garbage/vehicles/${vehicleId}/location-history`, { params });
        return response.data as any;
    },

    // --- PUBLIC (no auth) ---
    getLiveVehicles: async (cityId: string) => {
        const response = await api.get<any>('/garbage/public/live', { params: { cityId } });
        return response.data as any;
    },
    getRouteLive: async (routeId: string) => {
        const response = await api.get<any>(`/garbage/public/routes/${routeId}/live`);
        return response.data as any;
    },
};
