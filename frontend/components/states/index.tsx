'use client';

import React from 'react';
import { cn } from '@/utils/cn';

// ── Loading State ─────────────────────────────────────────────

export interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingState({ message = 'Loading...', size = 'md', className }: LoadingStateProps) {
    const spinnerSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

    return (
        <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
            <svg
                className={cn('animate-spin text-primary-500', spinnerSize)}
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {message && <p className="text-sm text-surface-400">{message}</p>}
        </div>
    );
}

// ── Error State ───────────────────────────────────────────────

export interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try again.',
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}>
            <div className="w-12 h-12 rounded-full bg-danger-500/10 flex items-center justify-center text-danger-500 text-xl">
                ⚠
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-surface-200">{title}</h3>
                <p className="text-sm text-surface-400 max-w-sm">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-sm rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors focus-ring"
                >
                    Try again
                </button>
            )}
        </div>
    );
}

// ── Empty State ───────────────────────────────────────────────

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}>
            {icon && (
                <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center text-2xl">
                    {icon}
                </div>
            )}
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-surface-200">{title}</h3>
                {description && <p className="text-sm text-surface-400 max-w-sm">{description}</p>}
            </div>
            {action && action}
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn('animate-pulse rounded-lg bg-surface-800 dark:bg-surface-700', className)} />
    );
}
