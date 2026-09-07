import { create } from 'zustand';
import type { TrackingStatus, VehicleLocationUpdatedPayload, VehicleStatusUpdatedPayload } from '../types/garbage.types';

/**
 * Live state for a single vehicle — kept up-to-date by WebSocket events.
 */
export interface LiveVehicleState {
    vehicleId: string;
    routeId: string | null;
    location: [number, number] | null; // [longitude, latitude]
    trackingStatus: TrackingStatus;
    speed?: number;
    heading?: number;
    currentStopId: string | null;
    nextStopId: string | null;
    progressPercent: number;
    completedStops: number;
    remainingStops: number;
    etaMinutes: number | null;
    etaLabel: string;
    lastUpdatedAt: string | null;
}

interface TrackingStore {
    /** Map of vehicleId → live state */
    vehicles: Record<string, LiveVehicleState>;
    /** Active city being tracked (for cleanup on city switch) */
    activeCityId: string | null;

    /** Apply a full location-updated WS payload */
    applyLocationUpdate: (payload: VehicleLocationUpdatedPayload) => void;
    /** Apply a status change (STALE / OFFLINE) */
    applyStatusUpdate: (payload: VehicleStatusUpdatedPayload) => void;
    /** Seed initial vehicle state (e.g. from REST call) */
    seedVehicle: (vehicleId: string, partial: Partial<LiveVehicleState>) => void;
    /** Remove a single vehicle */
    removeVehicle: (vehicleId: string) => void;
    /** Clear all vehicles — call on city switch or logout */
    clearAll: () => void;
    setActiveCity: (cityId: string | null) => void;
}

export const useTrackingStore = create<TrackingStore>((set) => ({
    vehicles: {},
    activeCityId: null,

    applyLocationUpdate: (payload) =>
        set((state) => ({
            vehicles: {
                ...state.vehicles,
                [payload.vehicleId]: {
                    vehicleId: payload.vehicleId,
                    routeId: payload.routeId,
                    location: payload.location.coordinates,
                    trackingStatus: payload.trackingStatus,
                    speed: payload.speed,
                    heading: payload.heading,
                    currentStopId: payload.currentStopId,
                    nextStopId: payload.nextStopId,
                    progressPercent: payload.progressPercent,
                    completedStops: payload.completedStops,
                    remainingStops: payload.remainingStops,
                    etaMinutes: payload.etaMinutes,
                    etaLabel: payload.etaLabel,
                    lastUpdatedAt: payload.lastUpdatedAt,
                },
            },
        })),

    applyStatusUpdate: (payload) =>
        set((state) => {
            const existing = state.vehicles[payload.vehicleId];
            if (!existing) return state;
            return {
                vehicles: {
                    ...state.vehicles,
                    [payload.vehicleId]: {
                        ...existing,
                        trackingStatus: payload.trackingStatus,
                        lastUpdatedAt: payload.lastLocationAt ?? existing.lastUpdatedAt,
                    },
                },
            };
        }),

    seedVehicle: (vehicleId, partial) =>
        set((state) => ({
            vehicles: {
                ...state.vehicles,
                [vehicleId]: {
                    vehicleId,
                    routeId: null,
                    location: null,
                    trackingStatus: 'NOT_TRACKING',
                    currentStopId: null,
                    nextStopId: null,
                    progressPercent: 0,
                    completedStops: 0,
                    remainingStops: 0,
                    etaMinutes: null,
                    etaLabel: 'ETA unavailable',
                    lastUpdatedAt: null,
                    ...partial,
                },
            },
        })),

    removeVehicle: (vehicleId) =>
        set((state) => {
            const { [vehicleId]: _, ...rest } = state.vehicles;
            return { vehicles: rest };
        }),

    clearAll: () => set({ vehicles: {} }),

    setActiveCity: (cityId) => set({ activeCityId: cityId }),
}));
