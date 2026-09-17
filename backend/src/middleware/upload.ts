import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary storage engine for multer.
 * Uploads directly to Cloudinary – no temp files on disk.
 * Stored under the `citypulse/reports` folder inside your Cloudinary account.
 */
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder: 'citypulse/reports',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        // Use original filename (without extension) as the public_id base
        public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_')}`,
        resource_type: 'image',
        // Optionally auto-convert everything to webp for smaller sizes:
        // format: 'webp',
    }),
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are permitted.'));
    }
};

export const uploadAttachment = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 5,                    // max 5 attachments
    },
});

// Re-export cloudinary so other modules can call destroy(), etc.
export { cloudinary };
