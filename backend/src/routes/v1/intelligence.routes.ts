import { Router } from 'express';
import { IntelligenceController } from '../../controllers/intelligence.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '../../constants/roles';

const router = Router();

// Secure all routes
router.use(authenticate);

// City Health Global Overview
router.get('/city-health', IntelligenceController.getCityHealthOverview);

// Events List
router.get('/events', IntelligenceController.getIntelligenceEvents);

// Detail specific event with related correlations
router.get('/events/:id', IntelligenceController.getIntelligenceDetails);

// Operator acknowledge / resolve
router.patch('/events/:id/status', requireRole(Role.CITY_ADMIN, Role.SUPER_ADMIN), IntelligenceController.updateEventStatus);

export default router;
