import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { Types } from 'mongoose';
import logger from '../utils/logger';
import { NotificationPreference } from '../models/NotificationPreference';

export class NotificationController {

    // GET /api/v1/notifications
    static async getNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const cityId = req.headers['x-city-id'] || req.user?.cityId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const { category, priority, status } = req.query;

            const query: any = { userId, cityId };

            if (category) query.category = category;
            if (priority) query.priority = priority;
            if (status) query.status = status;
            else query.status = { $in: ['UNREAD', 'READ'] }; // By default exclude ARCHIVED unless explicitly requested

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();

            const total = await Notification.countDocuments(query);

            res.json({
                success: true,
                data: {
                    notifications,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching notifications', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // GET /api/v1/notifications/unread-count
    static async getUnreadCount(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const cityId = req.headers['x-city-id'] || req.user?.cityId;

            const count = await Notification.countDocuments({
                userId,
                cityId,
                status: 'UNREAD'
            });

            res.json({ success: true, data: { count } });
        } catch (error) {
            logger.error('Error fetching unread count', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // PATCH /api/v1/notifications/:id/read
    static async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const notificationId = req.params.id;
            const userId = req.user?.id;

            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { status: 'READ', readAt: new Date() },
                { new: true }
            );

            if (!notification) {
                res.status(404).json({ success: false, message: 'Notification not found' });
                return;
            }

            res.json({ success: true, data: notification });
        } catch (error) {
            logger.error('Error marking notification as read', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // POST /api/v1/notifications/read-all
    static async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const cityId = req.headers['x-city-id'] || req.user?.cityId;

            await Notification.updateMany(
                { userId, cityId, status: 'UNREAD' },
                { $set: { status: 'READ', readAt: new Date() } }
            );

            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            logger.error('Error marking all notifications as read', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // POST /api/v1/notifications/:id/archive
    static async archiveNotification(req: Request, res: Response): Promise<void> {
        try {
            const notificationId = req.params.id;
            const userId = req.user?.id;

            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { status: 'ARCHIVED' },
                { new: true }
            );

            if (!notification) {
                res.status(404).json({ success: false, message: 'Notification not found' });
                return;
            }

            res.json({ success: true, data: notification });
        } catch (error) {
            logger.error('Error archiving notification', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // GET /api/v1/notifications/preferences
    static async getPreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const cityId = req.headers['x-city-id'] || req.user?.cityId;

            const preferences = await NotificationPreference.find({ userId, cityId }).lean();
            res.json({ success: true, data: preferences });
        } catch (error) {
            logger.error('Error fetching preferences', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // POST /api/v1/notifications/preferences
    static async updatePreference(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const cityId = req.headers['x-city-id'] || req.user?.cityId;
            const { category, inApp, email, sms, push, criticalOverride } = req.body;

            if (!category) {
                res.status(400).json({ success: false, message: 'Category is required' });
                return;
            }

            const pref = await NotificationPreference.findOneAndUpdate(
                { userId, cityId, category },
                { inApp, email, sms, push, criticalOverride },
                { new: true, upsert: true }
            );

            res.json({ success: true, data: pref });
        } catch (error) {
            logger.error('Error updating preference', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
