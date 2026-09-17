import { Router } from 'express';
import { ReportController } from '../../controllers/report.controller';
import { authenticate, requireRole, requireCityAccess } from '../../middleware/auth';
import { uploadAttachment, uploadMemory } from '../../middleware/upload';
import { validate, validateAll } from '../../middleware/validate';
import {
    createReportSchema,
    updateReportAdminParamsSchema, updateReportAdminBodySchema,
    addCommentParamsSchema, addCommentBodySchema,
    reportQuerySchema
} from '../../validators/report.validator';
import { Role } from '../../constants/roles';

const router = Router();

// ==========================================
// CITIZEN ROUTES (`/api/v1/reports/city/...`)
// ==========================================

// Create new report (with optional image limits)
// uploadAttachment.array('attachments', 5) allows up to 5 photos named 'attachments'
router.post(
    '/city',
    authenticate,
    requireRole(Role.CITIZEN),
    requireCityAccess((req) => (req as any).user.cityId),
    uploadAttachment.array('attachments', 5),
    validate(createReportSchema),
    ReportController.submitReport
);

// Analyze image for auto-fill
router.post(
    '/city/analyze-image',
    authenticate,
    requireRole(Role.CITIZEN),
    requireCityAccess((req) => (req as any).user.cityId),
    uploadMemory.single('image'),
    ReportController.analyzeImage
);

// Get all city reports (Public map view)
router.get(
    '/city',
    authenticate,
    requireRole(Role.CITIZEN),
    requireCityAccess((req) => (req as any).user.cityId),
    validate(reportQuerySchema, 'query'),
    ReportController.getCityReports
);

// Get my reports (history)
router.get(
    '/city/my',
    authenticate,
    requireRole(Role.CITIZEN),
    requireCityAccess((req) => (req as any).user.cityId),
    validate(reportQuerySchema, 'query'),
    ReportController.getMyReports
);

// Get specific report detail
router.get(
    '/city/:id',
    authenticate,
    requireRole(Role.CITIZEN),
    requireCityAccess((req) => (req as any).user.cityId),
    ReportController.getReportDetails
);

// Add comment to report (citizen)
router.post(
    '/city/:id/comments',
    authenticate,
    requireRole(Role.CITIZEN),
    requireCityAccess((req) => (req as any).user.cityId),
    validateAll({ params: addCommentParamsSchema, body: addCommentBodySchema }),
    ReportController.addComment
);

// ==========================================
// ADMIN ROUTES (`/api/v1/reports/admin/...`)
// ==========================================

// Get all city reports (Dashboard list)
router.get(
    '/admin',
    authenticate,
    requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN),
    // SUPER_ADMIN passes automatically, CITY_ADMIN enforces extraction
    requireCityAccess((req) => req.query.cityId as string || (req as any).user.cityId),
    validate(reportQuerySchema, 'query'),
    ReportController.getAdminReports
);

// Get specific admin report detail
router.get(
    '/admin/:id',
    authenticate,
    requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN),
    ReportController.getReportDetails
);

// Update status, verification, assignment
router.patch(
    '/admin/:id',
    authenticate,
    requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN),
    validateAll({ params: updateReportAdminParamsSchema, body: updateReportAdminBodySchema }),
    ReportController.updateReportAdmin
);

// Add internal or public comment from admin
router.post(
    '/admin/:id/comments',
    authenticate,
    requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN),
    validateAll({ params: addCommentParamsSchema, body: addCommentBodySchema }),
    ReportController.addComment
);

export default router;
