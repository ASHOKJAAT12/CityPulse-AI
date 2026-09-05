/* eslint-disable @typescript-eslint/require-await */
/**
 * NotificationService — Multi-channel notification abstraction.
 *
 * Architecture:
 *   NotificationService
 *       ├── InAppProvider   (stored in DB, sent via WebSocket)
 *       ├── PushProvider    (Firebase/One Signal — Phase 15)
 *       ├── EmailProvider   (SMTP — Phase 15)
 *       └── SMSProvider     (Twilio/MSG91 — Phase 15+)
 *
 * Usage:
 *   await notificationService.send({
 *     type: NotificationType.IN_APP,
 *     cityId: '...',
 *     userId: '...',
 *     title: 'Garbage Collection Reminder',
 *     message: 'Vehicle arriving in 30 minutes',
 *   });
 */

export enum NotificationType {
    IN_APP = 'IN_APP',
    PUSH = 'PUSH',
    EMAIL = 'EMAIL',
    SMS = 'SMS',
}

export interface NotificationPayload {
    type: NotificationType | NotificationType[];
    cityId: string;
    userId?: string;         // null = broadcast to city
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export interface NotificationProvider {
    send(payload: NotificationPayload): Promise<void>;
}

// ── Provider Stubs ────────────────────────────────────────────

class InAppNotificationProvider implements NotificationProvider {
    async send(_payload: NotificationPayload): Promise<void> {
        // Phase 15: save to `notifications` table, emit via Socket.IO
        throw new Error('InAppNotificationProvider: Not implemented — Phase 15');
    }
}

class PushNotificationProvider implements NotificationProvider {
    async send(_payload: NotificationPayload): Promise<void> {
        // Phase 15: integrate Firebase FCM / OneSignal
        throw new Error('PushNotificationProvider: Not implemented — Phase 15');
    }
}

class EmailNotificationProvider implements NotificationProvider {
    async send(_payload: NotificationPayload): Promise<void> {
        // Phase 15: send via SMTP using nodemailer
        throw new Error('EmailNotificationProvider: Not implemented — Phase 15');
    }
}

class SMSNotificationProvider implements NotificationProvider {
    async send(_payload: NotificationPayload): Promise<void> {
        // Phase 15+: integrate Twilio / MSG91
        throw new Error('SMSNotificationProvider: Not implemented — Phase 15+');
    }
}

// ── Service ───────────────────────────────────────────────────

export class NotificationService {
    private providers: Record<NotificationType, NotificationProvider> = {
        [NotificationType.IN_APP]: new InAppNotificationProvider(),
        [NotificationType.PUSH]: new PushNotificationProvider(),
        [NotificationType.EMAIL]: new EmailNotificationProvider(),
        [NotificationType.SMS]: new SMSNotificationProvider(),
    };

    async send(payload: NotificationPayload): Promise<void> {
        const types = Array.isArray(payload.type) ? payload.type : [payload.type];
        await Promise.allSettled(
            types.map((type) => this.providers[type].send({ ...payload, type }))
        );
    }
}

export const notificationService = new NotificationService();
