'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps {
    className?: string;
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

export interface CardHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
};

export function Card({ className, children, padding = 'md', hoverable = false }: CardProps) {
    return (
        <div
            className={cn(
                'card',
                paddingClasses[padding],
                hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, actions, className }: CardHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
            <div>
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
                {subtitle && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}
