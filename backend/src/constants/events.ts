/**
 * WebSocket event name constants for SmartCity 360.
 *
 * Naming convention: <domain>:<action>
 * These are the contracts that the frontend subscribes to.
 *
 * Phase 7+ will implement the actual emitters for most of these.
 */

// ── Connection ────────────────────────────────────────────────
export const WS_EVENTS = {
    // System
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    JOIN_CITY_ROOM: 'join:city-room',
    LEAVE_CITY_ROOM: 'leave:city-room',

    // City
    CITY_UPDATED: 'city:updated',

    // Garbage vehicles (Phase 7)
    GARBAGE_VEHICLE_LOCATION_UPDATED: 'garbage:vehicle-location-updated',
    GARBAGE_VEHICLE_STATUS_CHANGED: 'garbage:vehicle-status-changed',
    GARBAGE_ROUTE_UPDATED: 'garbage:route-updated',

    // Electricity (Phase 10)
    ELECTRICITY_OUTAGE_CREATED: 'electricity:outage-created',
    ELECTRICITY_OUTAGE_RESOLVED: 'electricity:outage-resolved',
    ELECTRICITY_STATUS_UPDATED: 'electricity:status-updated',

    // Traffic (Phase 11)
    TRAFFIC_UPDATED: 'traffic:updated',

    // Notifications (Phase 15)
    NOTIFICATION_NEW: 'notification:new',
    NOTIFICATION_READ: 'notification:read',

    // Reports (Phase 14)
    REPORT_STATUS_UPDATED: 'report:status-updated',
    REPORT_CREATED: 'report:created',

    // Alerts
    EMERGENCY_ALERT: 'alert:emergency',

    // AI (Phase 17)
    AI_ANOMALY_DETECTED: 'ai:anomaly-detected',
    AI_PREDICTION_READY: 'ai:prediction-ready',

    // Sensors (Phase 18)
    SENSOR_DATA_UPDATED: 'sensor:data-updated',
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

/** Room naming helpers */
export const roomName = {
    city: (cityId: string) => `city:${cityId}`,
    service: (cityId: string, service: string) => `city:${cityId}:${service}`,
    user: (userId: string) => `user:${userId}`,
} as const;
