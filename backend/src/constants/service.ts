export enum ServiceStatus {
    NORMAL = 'NORMAL',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
    NOT_AVAILABLE = 'NOT_AVAILABLE'
}

export interface ServiceState {
    key: string;
    name: string;
    status: ServiceStatus;
    message?: string;
    updatedAt: Date;
}
