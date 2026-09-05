import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely — prevents class conflicts.
 * Usage: cn('px-4 py-2', isActive && 'bg-primary-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        ...options,
    }).format(new Date(date));
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(date));
}

/**
 * Format a relative time (e.g., "2 minutes ago").
 */
export function formatRelativeTime(date: Date | string): string {
    const diff = Date.now() - new Date(date).getTime();
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return rtf.format(-seconds, 'second');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    const days = Math.floor(hours / 24);
    return rtf.format(-days, 'day');
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return `${str.slice(0, maxLength - 3)}...`;
}
