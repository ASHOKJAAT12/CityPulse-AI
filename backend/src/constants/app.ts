export const APP_NAME = 'SmartCity 360';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

/** Maximum request body size */
export const MAX_REQUEST_BODY_SIZE = '10mb';

/** Rate limiting */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;

/** Bcrypt */
export const BCRYPT_ROUNDS = 12;

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
