import api from '../lib/api';

export const evService = {
    getStations: async (cityId: string) => {
        return api.get(`/ev/${cityId}/stations`);
    },

    getStationById: async (cityId: string, stationId: string) => {
        return api.get(`/ev/${cityId}/stations/${stationId}`);
    },

    createStation: async (data: any) => {
        return api.post(`/ev/stations`, data);
    },

    updateStation: async (cityId: string, stationId: string, data: any) => {
        return api.patch(`/ev/${cityId}/stations/${stationId}`, data);
    },

    deleteStation: async (cityId: string, stationId: string) => {
        return api.delete(`/ev/${cityId}/stations/${stationId}`);
    },

    getConnectors: async (cityId: string, stationId: string) => {
        return api.get(`/ev/${cityId}/stations/${stationId}/connectors`);
    },

    addConnector: async (cityId: string, stationId: string, data: any) => {
        return api.post(`/ev/${cityId}/stations/${stationId}/connectors`, data);
    },

    updateConnector: async (cityId: string, stationId: string, connectorId: string, data: any) => {
        return api.patch(`/ev/${cityId}/stations/${stationId}/connectors/${connectorId}`, data);
    }
};
