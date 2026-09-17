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
    sm:   'p-4',
    md:   'p-5',
    lg:   'p-6',
};

export function Card({ className, children, padding = 'md', hoverable = false }: CardProps) {
    return (
        <div
            className={cn(
                'card',
                paddingClasses[padding],
                hoverable && [
                    'cursor-pointer transition-all duration-200',
                    'hover:shadow-[8px_8px_18px_rgba(163,177,198,0.55),_-8px_-8px_18px_rgba(255,255,255,0.92)] hover:-translate-y-0.5',
                ],
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
                <h3 className="text-sm font-semibold text-[#1A1D23]">{title}</h3>
                {subtitle && (
                    <p className="text-xs text-[#7B8494] mt-0.5">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}
