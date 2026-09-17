import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reports/ReportService';
import { DepartmentService } from '../services/reports/DepartmentService';
import { GeminiReportIntelligence } from '../services/intelligence/GeminiReportIntelligence';
import { IAttachment } from '../models';
import { cloudinary } from '../middleware/upload';
import https from 'https';
import http from 'http';

export class ReportController {

    static async submitReport(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId;
            const citizenId = (req as any).user.id;

            // Handle multer-cloudinary payload – f.path is the Cloudinary URL,
            // f.filename is the Cloudinary public_id.
            const files = req.files as Express.Multer.File[] || [];
            const attachments: IAttachment[] = files.map(f => ({
                url: (f as any).path,          // Cloudinary secure URL
                publicId: (f as any).filename,  // Cloudinary public_id for deletion
                fileType: f.mimetype,
                size: f.size,
                uploadedAt: new Date()
            }));

            const report = await ReportService.createReport(cityId, citizenId, req.body, attachments);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    static async analyzeImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No image uploaded for analysis' });
            }

            const mimeType = req.file.mimetype;
            // multer-storage-cloudinary puts the Cloudinary URL in file.path
            const cloudinaryUrl: string = (req.file as any).path;
            const publicId: string = (req.file as any).filename;

            // Fetch the image from Cloudinary and convert to base64 for Gemini
            const base64Data = await new Promise<string>((resolve, reject) => {
                const client = cloudinaryUrl.startsWith('https') ? https : http;
                client.get(cloudinaryUrl, (imgRes) => {
                    const chunks: Buffer[] = [];
                    imgRes.on('data', (chunk: Buffer) => chunks.push(chunk));
                    imgRes.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
                    imgRes.on('error', reject);
                });
            });

            const aiResult = await GeminiReportIntelligence.analyzeImage(mimeType, base64Data);

            // Delete the temp analysis upload from Cloudinary
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cleanupError) {
                console.error('Failed to delete temp Cloudinary analysis image', cleanupError);
            }

            if (!aiResult) {
                return res.status(500).json({ success: false, message: 'AI limit exceeded or failed to analyze image.' });
            }

            res.status(200).json({ success: true, data: aiResult });
        } catch (error) {
            next(error);
        }
    }

    static async getMyReports(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId;
            const citizenId = (req as any).user.id;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const filters = { citizenId, ...req.query };

            const result = await ReportService.getReports(cityId, filters, { page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getAdminReports(req: Request, res: Response, next: NextFunction) {
        try {
            // Safe checking mapping
            const cityId = (req as any).user.cityId === null ? req.query.cityId as string : (req as any).user.cityId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await ReportService.getReports(cityId, req.query, { page, limit });
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    static async getReportDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId === null ? req.query.cityId as string : (req as any).user.cityId;
            const reportId = req.params.id;

            const details = await ReportService.getReportDetails(cityId, reportId);

            // Mask internal tracking logic if accessed by citizen
            if ((req as any).user.role === 'CITIZEN') {
                details.timeline = details.timeline.filter((t: any) => t.visibleToCitizen);
                details.comments = details.comments.filter((c: any) => c.visibleToCitizen);
            }

            res.status(200).json({ success: true, data: details });
        } catch (error) {
            next(error);
        }
    }

    static async updateReportAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId === null ? req.body.cityId : (req as any).user.cityId;
            const reportId = req.params.id;

            const report = await ReportService.updateReportStatus(cityId, reportId, req.body, (req as any).user);
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            next(error);
        }
    }

    static async addComment(req: Request, res: Response, next: NextFunction) {
        try {
            // Users and Admins can both comment. Handle scope.
            const cityId = (req as any).user.cityId === null ? req.body.cityId : (req as any).user.cityId;
            const reportId = req.params.id;
            const authorRole = (req as any).user.role;
            const authorId = (req as any).user.id;

            // Citizens default false for visibility is weird. We force it true if they are citizens.
            const visibleToCitizen = authorRole === 'CITIZEN' ? true : req.body.visibleToCitizen !== false;

            const comment = await ReportService.addComment(cityId, reportId, authorId, authorRole, req.body.message, visibleToCitizen);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            next(error);
        }
    }
}
