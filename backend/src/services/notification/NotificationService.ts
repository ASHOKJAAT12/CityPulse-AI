import { Types } from 'mongoose';
import { Notification, INotification } from '../../models/Notification';
import { NotificationPreference } from '../../models/NotificationPreference';
import { User } from '../../models/User';
import { getIO, emitToCityRoom } from '../../websocket';
import { WS_EVENTS, roomName } from '../../constants/events';
import logger from '../../utils/logger';

export enum NotificationAudience {
    USER = 'USER',
    CITY = 'CITY',
    ROLE = 'ROLE',
    DEPARTMENT = 'DEPARTMENT'
}

export interface NotificationPayload {
    cityId: string | Types.ObjectId;
    audience: NotificationAudience;
    userId?: string | Types.ObjectId;     // For USER
    role?: string;                        // For ROLE
    department?: string | Types.ObjectId; // For DEPARTMENT
    category: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE' | 'CITIZEN_REPORT' | 'SYSTEM' | 'MAINTENANCE' | 'SECURITY';
    priority: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
    expiresAt?: Date;
    referenceType?: string;
    referenceId?: string | Types.ObjectId;
    metadata?: Record<string, unknown>;
    type?: 'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS';
}

export class NotificationService {
    // 5 minutes by default or configurable
    private readonly deduplicationWindowMs = Number(process.env.NOTIFICATION_DEDUP_WINDOW_SECONDS || 300) * 1000;

    /**
     * Entry point to dispatch a notification to the specified audience.
     */
    async send(payload: NotificationPayload): Promise<void> {
        try {
            // Validate basic required fields
            if (!payload.cityId || !payload.category || !payload.title || !payload.message || !payload.audience) {
                logger.warn('NotificationService: Missing required payload fields', { payload });
                return;
            }

            // Fallback type if not provided
            const type = payload.type || 'IN_APP';

            // Resolve target users
            const targetUserIds = await this.resolveAudience(payload);

            if (!targetUserIds.length) {
                return; // Nobody to notify
            }

            // For broadcasts to extremely large numbers of users, we cap or distribute.
            // In Phase 12, we iterate. (Pagination/Batching for production-scale would be done here)

            // Generate DB docs and Emit WebSocket events in batches
            const createdDocs = await this.processDispatches(targetUserIds, payload, type);

            logger.info(`NotificationService: Delivered ${createdDocs.length} notifications for event ${payload.title}`);

        } catch (error) {
            logger.error('NotificationService: Error dispatching notification', { error });
        }
    }

    private async resolveAudience(payload: NotificationPayload): Promise<Types.ObjectId[]> {
        let targets: Types.ObjectId[] = [];

        switch (payload.audience) {
            case NotificationAudience.USER:
                if (payload.userId) {
                    targets.push(new Types.ObjectId(payload.userId));
                }
                break;

            case NotificationAudience.CITY:
                // All citizens + admins mapping to this city.
                // To avoid unbounded memory in very large cities, one would typically use streams.
                // For Phase 12, we fetch _ids only.
                const cityUsers = await User.find({
                    $or: [
                        { cityId: payload.cityId },
                        { adminCityId: payload.cityId }
                    ],
                    status: 'ACTIVE'
                }, '_id').lean();
                targets = cityUsers.map(u => u._id as Types.ObjectId);
                break;

            case NotificationAudience.ROLE:
                if (!payload.role) break;
                const roleUsers = await User.find({
                    $or: [
                        { cityId: payload.cityId },
                        { adminCityId: payload.cityId }
                    ],
                    role: payload.role,
                    status: 'ACTIVE'
                }, '_id').lean();
                targets = roleUsers.map(u => u._id as Types.ObjectId);
                break;

            case NotificationAudience.DEPARTMENT:
                // Extending for dept logic if required (mostly admins tied to dept)
                // If department is mapped to a User natively: 
                // For now, assume department maps to specific roles. 
                // Placeholder for future DB relations
                break;
        }

        return targets;
    }

    private async processDispatches(userIds: Types.ObjectId[], payload: NotificationPayload, type: string): Promise<INotification[]> {
        const out: INotification[] = [];
        const now = Date.now();
        const cutoff = new Date(now - this.deduplicationWindowMs);

        // Batch preference lookups
        const prefs = await NotificationPreference.find({
            userId: { $in: userIds },
            cityId: payload.cityId,
            category: payload.category
        }).lean();

        const prefMap = new Map(prefs.map(p => [p.userId.toString(), p]));

        // Fetch recent identical notifications to deduplicate
        // Deduplication compound key: (userId, category, referenceType, referenceId, createdAt > cutoff)
        const recentNotifs = await Notification.find({
            userId: { $in: userIds },
            cityId: payload.cityId,
            category: payload.category,
            referenceType: payload.referenceType,
            referenceId: payload.referenceId,
            createdAt: { $gte: cutoff }
        }, 'userId').lean();

        const recentNotifSet = new Set(recentNotifs.map(n => n.userId?.toString()));

        for (const uid of userIds) {
            const uidStr = uid.toString();

            // 1. Deduplication check
            if (payload.referenceId && payload.referenceType && recentNotifSet.has(uidStr)) {
                continue; // Skip duplicate
            }

            // 2. Preference evaluation
            const pref = prefMap.get(uidStr);
            const isCritical = ['HIGH', 'CRITICAL'].includes(payload.priority);

            let shouldSendInApp = true; // default true if no preference doc exists
            if (pref) {
                // Determine if they turned it off, but respect critical override
                if (pref.inApp === false) {
                    shouldSendInApp = !!(pref.criticalOverride && isCritical);
                }
            }

            if (!shouldSendInApp) {
                continue;
            }

            // 3. Create Notification
            const doc = new Notification({
                userId: uid,
                cityId: payload.cityId,
                type: type,
                category: payload.category,
                priority: payload.priority,
                title: payload.title,
                message: payload.message,
                status: 'UNREAD',
                expiresAt: payload.expiresAt,
                referenceType: payload.referenceType,
                referenceId: payload.referenceId,
                metadata: payload.metadata
            });
            await doc.save();
            out.push(doc);

            // 4. Emit WS to the user's specific room
            try {
                const io = getIO();
                io.to(roomName.user(uidStr)).emit(WS_EVENTS.NOTIFICATION_NEW, doc);

                // Re-calculate the unread count optionally, or just let frontend increment
                const unreadCount = await Notification.countDocuments({ userId: uid, status: 'UNREAD' });
                io.to(roomName.user(uidStr)).emit(WS_EVENTS.NOTIFICATION_COUNT_UPDATED, { unread: unreadCount });
            } catch (err) {
                logger.error('WebSocket dispatch failed', { error: err });
            }
        }

        return out;
    }
}

export const notificationService = new NotificationService();
