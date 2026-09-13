export interface MapLayerConfig {
    key: string;
    label: string;
    description?: string;
    icon?: string;
    color?: string;
    enabled: boolean;
    available: boolean;
    endpoint?: string;
}

export const MAP_LAYERS: Record<string, MapLayerConfig> = {
    TRAFFIC: {
        key: 'TRAFFIC',
        label: 'Traffic & Events',
        color: '#ef4444',
        enabled: true,
        available: true,
        description: 'Real-time traffic flow and incident reports',
        endpoint: '/api/v1/services/traffic'
    },
    EV: {
        key: 'EV',
        label: 'EV Stations',
        color: '#10b981',
        enabled: true,
        available: true,
        description: 'Available electric vehicle charging stations',
        endpoint: '/api/v1/ev/stations'
    },
    GARBAGE: {
        key: 'GARBAGE',
        label: 'Waste Mgmt',
        color: '#10b981', // Changed to emerald tone matching garbage routes styling
        enabled: true,
        available: true,
        description: 'Garbage collection vehicles and routes',
        endpoint: '/api/v1/services/garbage'
    },
    WATER: {
        key: 'WATER',
        label: 'Water Lines',
        color: '#3b82f6',
        enabled: true,
        available: true,
        description: 'Water infrastructure and pipeline status',
        endpoint: '/api/v1/services/water'
    },
    ELECTRICITY: {
        key: 'ELECTRICITY',
        label: 'Power Grid',
        color: '#eab308',
        enabled: true,
        available: true,
        description: 'Power grid sub-stations and outages',
        endpoint: '/api/v1/services/electricity'
    },
    REPORTS: {
        key: 'REPORTS',
        label: 'Citizen Reports',
        color: '#f97316',
        enabled: true,
        available: true,
        description: 'Issues reported by citizens',
        endpoint: '/api/v1/reports/city/my'
    },
    STREET_LIGHT: {
        key: 'STREET_LIGHT',
        label: 'Street Lights',
        color: '#f59e0b',
        enabled: true,
        available: true,
        description: 'Street light operational status',
        endpoint: '/api/v1/streetlights/assets'
    },
    INTELLIGENCE: {
        key: 'INTELLIGENCE',
        label: 'AI Command Center',
        color: '#6366f1',
        enabled: true,
        available: true,
        description: 'Correlated AI risk hotspots and systemic alerts',
        endpoint: '/api/v1/intelligence/events'
    }
};

export const getAvailableLayers = (): MapLayerConfig[] => Object.values(MAP_LAYERS).filter(layer => layer.available);
export const getAllLayers = (): MapLayerConfig[] => Object.values(MAP_LAYERS);
