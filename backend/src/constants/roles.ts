/**
 * User roles in the SmartCity 360 platform.
 *
 * Role hierarchy (highest → lowest):
 *   SUPER_ADMIN → full platform access, all cities
 *   CITY_ADMIN  → full access within their assigned city
 *   CITIZEN     → limited access to their city's public services
 *
 * Future roles (Phase 3+):
 *   DEPARTMENT_ADMIN, OPERATOR, DRIVER, TECHNICIAN, OFFICER
 */
export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    CITY_ADMIN = 'CITY_ADMIN',
    CITIZEN = 'CITIZEN',
}

export enum CityStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

/**
 * Permission categories — used for future fine-grained RBAC.
 * Actual enforcement implemented in Phase 1+.
 */
export enum Permission {
    // City management
    MANAGE_CITIES = 'MANAGE_CITIES',
    VIEW_ALL_CITIES = 'VIEW_ALL_CITIES',

    // User management
    MANAGE_ADMINS = 'MANAGE_ADMINS',
    MANAGE_CITIZENS = 'MANAGE_CITIZENS',
    VIEW_USERS = 'VIEW_USERS',

    // Infrastructure
    MANAGE_WATER = 'MANAGE_WATER',
    MANAGE_ELECTRICITY = 'MANAGE_ELECTRICITY',
    MANAGE_TRAFFIC = 'MANAGE_TRAFFIC',
    MANAGE_EV = 'MANAGE_EV',
    MANAGE_STREET_LIGHTS = 'MANAGE_STREET_LIGHTS',
    MANAGE_GARBAGE = 'MANAGE_GARBAGE',

    // Reports
    VIEW_REPORTS = 'VIEW_REPORTS',
    MANAGE_REPORTS = 'MANAGE_REPORTS',
    SUBMIT_REPORTS = 'SUBMIT_REPORTS',

    // Notifications
    SEND_NOTIFICATIONS = 'SEND_NOTIFICATIONS',
    VIEW_NOTIFICATIONS = 'VIEW_NOTIFICATIONS',

    // AI
    VIEW_AI_INSIGHTS = 'VIEW_AI_INSIGHTS',

    // Audit
    VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
}

/** Roles that can bypass city-scope restrictions */
export const GLOBAL_ROLES: Role[] = [Role.SUPER_ADMIN];

/** Check if a role has global (multi-city) access */
export function isGlobalRole(role: Role): boolean {
    return GLOBAL_ROLES.includes(role);
}
