import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { notificationService, NotificationAudience } from '../services/notification/NotificationService';
import logger from '../utils/logger';

export class AdminNotificationController {

    // GET /api/v1/admin/notifications
    static async getCityNotifications(req: Request, res: Response): Promise<void> {
        try {
            const cityId = req.headers['x-city-id'] || req.user?.cityId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
            const { category, priority } = req.query;

            const query: any = { cityId };

            if (category) query.category = category;
            if (priority) query.priority = priority;

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
            logger.error('Error fetching admin notifications', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // POST /api/v1/admin/notifications/announcements
    static async createAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const cityId = req.headers['x-city-id'] || req.user?.cityId;
            const { title, message, category, priority, expiresAt } = req.body;

            if (!title || !message || !category) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }

            if (!cityId) {
                res.status(400).json({ success: false, message: 'No city context identified' });
                return;
            }

            // Dispatch to entire city. NotificationService handles the DB creation and WebSocket fanout.
            await notificationService.send({
                cityId: cityId as string,
                audience: NotificationAudience.CITY,
                category: category,
                priority: priority || 'INFO',
                title: title,
                message: message,
                type: 'IN_APP',
                referenceType: 'ANNOUNCEMENT',
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                metadata: {
                    createdBy: req.user?.id
                }
            });

            res.status(201).json({ success: true, message: 'Announcement dispatched successfully' });
        } catch (error) {
            logger.error('Error creating announcement', { error });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
