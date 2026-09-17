import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reports/ReportService';
import { DepartmentService } from '../services/reports/DepartmentService';
import { GeminiReportIntelligence } from '../services/intelligence/GeminiReportIntelligence';
import { IAttachment } from '../models';
import { cloudinary } from '../middleware/upload';
import sharp from 'sharp';

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

            // Downscale massively before feeding to Gemini
            const compressedBuffer = await sharp(req.file.buffer)
                .resize({ width: 800, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();

            const mimeType = 'image/jpeg';
            const base64Data = compressedBuffer.toString('base64');

            const aiResult = await GeminiReportIntelligence.analyzeImage(mimeType, base64Data);

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

    static async getCityReports(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = (req as any).user.cityId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await ReportService.getReports(cityId, req.query, { page, limit });
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
