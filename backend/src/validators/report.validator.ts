import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

// Custom validator for Mongoose ObjectId
const objectIdSchema = z.string().refine((val) => isValidObjectId(val), {
    message: 'Invalid ObjectId',
});

// Category enforcement matching Report Model
const categoryOptions = [
    'WATER', 'ELECTRICITY', 'TRAFFIC', 'GARBAGE',
    'STREETLIGHT', 'EV', 'ROAD', 'DRAINAGE',
    'PUBLIC_SAFETY', 'ENVIRONMENT', 'OTHER'
] as const;

export const createReportSchema = z.object({
    body: z.object({
        category: z.enum(categoryOptions),
        subcategory: z.string().min(2),
        title: z.string().min(3).max(120),
        description: z.string().min(10).max(2000),
        longitude: z.coerce.number().min(-180).max(180),
        latitude: z.coerce.number().min(-90).max(90),
        address: z.string().optional(),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
        source: z.enum(['WEB', 'MOBILE', 'ADMIN', 'IMPORT']).default('WEB'),
        // Optional links bridging other modules
        relatedAssetType: z.string().optional(),
        relatedAssetId: objectIdSchema.optional()
    })
});

// Only Admins can modify status/assignment
export const updateReportAdminSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']).optional(),
        verificationStatus: z.enum(['UNVERIFIED', 'VERIFIED', 'REJECTED']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
        department: objectIdSchema.optional(),
        assignedTo: objectIdSchema.optional(),
        resolution: z.string().optional(),
        duplicateOf: objectIdSchema.optional()
    })
});

// Add comment to report
export const addCommentSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
    body: z.object({
        message: z.string().min(2).max(2500),
        visibleToCitizen: z.boolean().default(true)
    })
});

export const reportQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(50),
        status: z.string().optional(),
        category: z.string().optional(),
        department: objectIdSchema.optional(),
        priority: z.string().optional()
    })
});
