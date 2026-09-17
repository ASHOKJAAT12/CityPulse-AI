'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import type { StatusColor } from '@/types';

export type BadgeVariant = StatusColor | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
    children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger:  'badge-danger',
    info:    'badge-info',
    neutral: 'badge-neutral',
    primary: [
        'inline-flex items-center rounded-full text-xs font-medium',
        'bg-[rgba(79,107,237,0.1)] text-[#4F6BED]',
    ].join(' '),
};

const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
};

const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    info:    'bg-blue-500',
    neutral: 'bg-[#A8B0C0]',
    primary: 'bg-[#4F6BED]',
};

export function Badge({
    variant = 'neutral',
    size = 'md',
    dot = false,
    className,
    children,
}: BadgeProps) {
    return (
        <span className={cn(variantClasses[variant], sizeClasses[size], className)}>
            {dot && (
                <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 shrink-0', dotColors[variant])} />
            )}
            {children}
        </span>
    );
}
