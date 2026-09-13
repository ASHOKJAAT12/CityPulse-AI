import api from './api';

export interface StreetlightZone {
    _id: string;
    cityId: string;
    name: string;
    zoneCode: string;
    status: string;
    active: boolean;
}

export interface StreetlightAsset {
    _id: string;
    cityId: string;
    name: string;
    assetCode: string;
    assetType: string;
    status: string;
    active: boolean;
    location: { coordinates: [number, number] };
    zoneId?: any; // populated
}

export const streetlightService = {
    // Assets
    getAssets: () => api.get('/streetlights/assets'),
    getAssetById: (id: string) => api.get(`/streetlights/assets/${id}`),
    createAsset: (data: Partial<StreetlightAsset>) => api.post('/streetlights/assets', data),
    updateAsset: (id: string, data: Partial<StreetlightAsset>) => api.patch(`/streetlights/assets/${id}`, data),
    overrideState: (id: string, requestedState: string, brightnessPercentage?: number) =>
        api.post(`/streetlights/assets/${id}/override`, { requestedState, brightnessPercentage }),

    // Zones
    getZones: () => api.get('/streetlights/zones'),
    createZone: (data: Partial<StreetlightZone>) => api.post('/streetlights/zones', data),

    // Sensors
    getSensors: () => api.get('/streetlights/sensors'),
    ingestReading: (id: string, value: number, source = 'ADMIN') =>
        api.post(`/streetlights/sensors/${id}/readings`, { value, source })
};
