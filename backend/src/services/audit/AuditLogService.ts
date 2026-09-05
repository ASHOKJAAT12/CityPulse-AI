import { AuditLog } from '../../models';
import logger from '../../utils/logger';

/**
 * AuditLogService — Records significant mutations across the platform.
 *
 * Usage:
 *   await auditLogService.log({
 *     action: 'UPDATE',
 *     resourceType: 'GarbageRoute',
 *     resourceId: route.id,
 *     cityId: route.cityId,
 *     performedById: req.user.id,
 *     performerEmail: req.user.email,
 *     previousState: oldRoute,
 *     newState: updatedRoute,
 *     requestId: req.id,
 *     ipAddress: req.ip,
 *   });
 */

export interface AuditLogEntry {
    action: string;
    resourceType: string;
    resourceId?: string;
    description?: string;
    cityId?: string;
    performedById?: string;
    performerEmail?: string;
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}

export class AuditLogService {
    /**
     * Record an audit log entry.
     * Failures are logged but do NOT bubble up — auditing must never break
     * the main request flow.
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            await AuditLog.create({
                action: entry.action,
                resourceType: entry.resourceType,
                resourceId: entry.resourceId,
                description: entry.description,
                cityId: entry.cityId,
                performedById: entry.performedById,
                performerEmail: entry.performerEmail,
                previousState: entry.previousState,
                newState: entry.newState,
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent,
                requestId: entry.requestId,
            });
        } catch (error) {
            // Audit log failures must never disrupt the main request
            logger.error('Failed to write audit log entry', { error, entry: { ...entry, previousState: '[redacted]', newState: '[redacted]' } });
        }
    }
}

export const auditLogService = new AuditLogService();
