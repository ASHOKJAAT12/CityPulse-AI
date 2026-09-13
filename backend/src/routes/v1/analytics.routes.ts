import { Router } from 'express';
import { AnalyticsController } from '../../controllers/analytics.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router();

// Apply auth to all analytics routes
router.use(authenticate);

// City endpoints - requires user to have access to the city
router.get('/dashboard', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getDashboard);
router.get('/city-health', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getCityHealth);
router.get('/services/:service', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getServiceMetrics);
router.get('/trends', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getTrends);
router.get('/geography', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getGeography);
router.get('/departments', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getDepartments);
router.get('/emergency', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getEmergencyAnalytics);
router.get('/ai', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getAIAnalytics);
router.get('/reports', requireCityAccess((req) => req.query.cityId as string), AnalyticsController.getReportAnalytics);

router.post('/export', requireRole(Role.SUPER_ADMIN, Role.CITY_ADMIN), requireCityAccess((req) => req.body.cityId), AnalyticsController.exportData);

// SUPER_ADMIN only endpoint
router.get('/compare', requireRole(Role.SUPER_ADMIN), AnalyticsController.compareCities);

export default router;
