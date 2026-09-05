/* eslint-disable @typescript-eslint/require-await */
/**
 * FileStorageService — Provider-agnostic abstraction for file uploads.
 *
 * Architecture:
 *   FileStorageService (interface)
 *       ↓
 *   CloudinaryStorageProvider (Phase 0 stub → Phase 14 implementation)
 *
 * Controllers and services should ONLY use FileStorageService,
 * never call Cloudinary SDK directly.
 */

export interface UploadOptions {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: Record<string, unknown>;
    tags?: string[];
    publicId?: string;
}

export interface UploadResult {
    url: string;
    secureUrl: string;
    publicId: string;
    resourceType: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
}

export interface FileStorageProvider {
    upload(fileBuffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
    delete(publicId: string): Promise<void>;
    getSignedUrl(publicId: string, expiresInSeconds?: number): Promise<string>;
}

/**
 * Cloudinary implementation stub.
 * Phase 14 will complete the implementation.
 */
export class CloudinaryStorageProvider implements FileStorageProvider {
    constructor() {
        // Phase 14: initialize cloudinary with env.CLOUDINARY_* credentials
        // cloudinary.config({
        //   cloud_name: env.CLOUDINARY_CLOUD_NAME,
        //   api_key: env.CLOUDINARY_API_KEY,
        //   api_secret: env.CLOUDINARY_API_SECRET,
        // });
    }

    async upload(_fileBuffer: Buffer, _options?: UploadOptions): Promise<UploadResult> {
        throw new Error('FileStorageService.upload: Not implemented — Phase 14');
    }

    async delete(_publicId: string): Promise<void> {
        throw new Error('FileStorageService.delete: Not implemented — Phase 14');
    }

    async getSignedUrl(_publicId: string, _expiresInSeconds?: number): Promise<string> {
        throw new Error('FileStorageService.getSignedUrl: Not implemented — Phase 14');
    }
}

/** Singleton storage provider instance */
export const fileStorageService: FileStorageProvider = new CloudinaryStorageProvider();
