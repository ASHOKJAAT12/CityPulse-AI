import { Request, Response, NextFunction } from 'express';
import { CityKPIEngine } from '../services/analytics/CityKPIEngine';
import { TrendEngine } from '../services/analytics/TrendEngine';
import { GeographicAnalyticsEngine } from '../services/analytics/GeographicAnalyticsEngine';
import { ReportExportService } from '../services/analytics/ReportExportService';
import { ServiceComparisonEngine } from '../services/analytics/ServiceComparisonEngine';
import { Types } from 'mongoose';
import { AppError } from '../utils/AppError';

export class AnalyticsController {

    static async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            if (!cityId) throw AppError.badRequest('cityId is required query parameter');

            const dashboardData = await CityKPIEngine.getDashboard(cityId);
            res.status(200).json({ status: 'success', data: dashboardData });
        } catch (err) {
            next(err);
        }
    }

    static async getCityHealth(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            if (!cityId) throw AppError.badRequest('cityId is required query parameter');

            const healthData = await CityKPIEngine.getCityHealth(cityId);
            res.status(200).json({ status: 'success', data: healthData });
        } catch (err) {
            next(err);
        }
    }

    static async getServiceMetrics(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const service = req.params.service;
            const timeRange = (req.query.range as string) || '24h';

            const metrics = await ServiceComparisonEngine.getServiceMetrics(cityId, service, timeRange);
            res.status(200).json({ status: 'success', data: metrics });
        } catch (err) {
            next(err);
        }
    }

    static async getTrends(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const trendData = await TrendEngine.getOverallTrends(cityId);
            res.status(200).json({ status: 'success', data: trendData });
        } catch (err) {
            next(err);
        }
    }

    static async getGeography(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const hotspots = await GeographicAnalyticsEngine.getHotspots(cityId);
            res.status(200).json({ status: 'success', data: hotspots });
        } catch (err) {
            next(err);
        }
    }

    static async getDepartments(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const deptStats = await CityKPIEngine.getDepartmentMetrics(cityId);
            res.status(200).json({ status: 'success', data: deptStats });
        } catch (err) {
            next(err);
        }
    }

    static async getEmergencyAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const emergencyData = await CityKPIEngine.getEmergencyAnalytics(cityId);
            res.status(200).json({ status: 'success', data: emergencyData });
        } catch (err) {
            next(err);
        }
    }

    static async getAIAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const aiData = await CityKPIEngine.getAIAnalytics(cityId);
            res.status(200).json({ status: 'success', data: aiData });
        } catch (err) {
            next(err);
        }
    }

    static async getReportAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const cityId = req.query.cityId as string;
            const reportData = await CityKPIEngine.getCitizenReportAnalytics(cityId);
            res.status(200).json({ status: 'success', data: reportData });
        } catch (err) {
            next(err);
        }
    }

    static async compareCities(req: Request, res: Response, next: NextFunction) {
        try {
            const cityIds = (req.query.cityIds as string)?.split(',');
            if (!cityIds || cityIds.length < 2) throw AppError.badRequest('At least 2 cityIds required');

            const comparison = await ServiceComparisonEngine.compareCities(cityIds);
            res.status(200).json({ status: 'success', data: comparison });
        } catch (err) {
            next(err);
        }
    }

    static async exportData(req: Request, res: Response, next: NextFunction) {
        try {
            const { cityId, format, metrics, startDate, endDate } = req.body;
            const exportFile = await ReportExportService.generateExport(cityId, format, metrics, startDate, endDate);

            if (format === 'csv') {
                res.header('Content-Type', 'text/csv');
                res.attachment(`export_${new Date().getTime()}.csv`);
            } else {
                res.header('Content-Type', 'application/json');
                res.attachment(`export_${new Date().getTime()}.json`);
            }
            return res.send(exportFile);
        } catch (err) {
            next(err);
        }
    }
}
