'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:bg-primary-600/50',
    secondary:
        'bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-700 disabled:opacity-50',
    ghost:
        'hover:bg-surface-800 text-surface-200 disabled:opacity-50',
    danger:
        'bg-danger-600 hover:bg-danger-700 text-white shadow-sm disabled:opacity-50',
    outline:
        'border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 disabled:opacity-50',
};

const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
};

const Spinner = ({ size }: { size: ButtonSize }) => (
    <svg
        className={cn(
            'animate-spin',
            size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        )}
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
    </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled ?? isLoading}
                className={cn(
                    'inline-flex items-center justify-center font-medium rounded-lg',
                    'transition-colors duration-150 focus-ring',
                    'disabled:cursor-not-allowed',
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Spinner size={size} />
                ) : (
                    leftIcon && <span className="shrink-0">{leftIcon}</span>
                )}
                {children}
                {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
