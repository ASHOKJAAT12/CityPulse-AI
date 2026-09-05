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
        enabled: false,
        available: false,
        description: 'Real-time traffic flow and incident reports',
        endpoint: '/api/v1/services/traffic'
    },
    EV: {
        key: 'EV',
        label: 'EV Stations',
        color: '#10b981',
        enabled: false,
        available: false,
        description: 'Available electric vehicle charging stations',
        endpoint: '/api/v1/services/ev'
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
        enabled: false,
        available: false,
        description: 'Water infrastructure and pipeline status',
        endpoint: '/api/v1/services/water'
    },
    ELECTRICITY: {
        key: 'ELECTRICITY',
        label: 'Power Grid',
        color: '#eab308',
        enabled: false,
        available: false,
        description: 'Power grid sub-stations and outages',
        endpoint: '/api/v1/services/electricity'
    },
    REPORTS: {
        key: 'REPORTS',
        label: 'Citizen Reports',
        color: '#f97316',
        enabled: false,
        available: false,
        description: 'Issues reported by citizens',
        endpoint: '/api/v1/services/reports'
    },
    STREET_LIGHT: {
        key: 'STREET_LIGHT',
        label: 'Street Lights',
        color: '#f59e0b',
        enabled: false,
        available: false,
        description: 'Street light operational status',
        endpoint: '/api/v1/services/street-lights'
    }
};

export const getAvailableLayers = (): MapLayerConfig[] => Object.values(MAP_LAYERS).filter(layer => layer.available);
export const getAllLayers = (): MapLayerConfig[] => Object.values(MAP_LAYERS);
