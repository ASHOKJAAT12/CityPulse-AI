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
    primary: [
        'bg-white text-[#4F6BED] font-semibold',
        'shadow-[6px_6px_14px_rgba(163,177,198,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)]',
        'hover:shadow-[8px_8px_18px_rgba(163,177,198,0.55),_-8px_-8px_18px_rgba(255,255,255,0.92)] hover:-translate-y-px',
        'active:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.9)] active:translate-y-0',
        'disabled:opacity-50 disabled:shadow-[3px_3px_8px_rgba(163,177,198,0.4),_-3px_-3px_8px_rgba(255,255,255,0.85)] disabled:translate-y-0',
        'border border-white/80',
    ].join(' '),

    secondary: [
        'bg-white text-[#1A1D23] font-medium',
        'shadow-[6px_6px_14px_rgba(163,177,198,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)]',
        'hover:shadow-[8px_8px_18px_rgba(163,177,198,0.55),_-8px_-8px_18px_rgba(255,255,255,0.92)] hover:-translate-y-px',
        'active:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.9)] active:translate-y-0',
        'disabled:opacity-50',
        'border border-white/80',
    ].join(' '),

    ghost: [
        'bg-transparent text-[#7B8494] font-medium',
        'shadow-none border border-transparent',
        'hover:bg-white hover:text-[#1A1D23]',
        'hover:shadow-[3px_3px_8px_rgba(163,177,198,0.55),_-3px_-3px_8px_rgba(255,255,255,0.92)]',
        'active:shadow-[inset_2px_2px_6px_rgba(163,177,198,0.45),_inset_-2px_-2px_6px_rgba(255,255,255,0.9)]',
        'disabled:opacity-50',
    ].join(' '),

    danger: [
        'bg-white text-red-500 font-semibold',
        'shadow-[6px_6px_14px_rgba(163,177,198,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)]',
        'hover:shadow-[8px_8px_18px_rgba(163,177,198,0.55),_-8px_-8px_18px_rgba(255,255,255,0.92)] hover:-translate-y-px',
        'active:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.9)] active:translate-y-0',
        'disabled:opacity-50',
        'border border-white/80',
    ].join(' '),

    outline: [
        'bg-white text-[#7B8494] font-medium',
        'shadow-[3px_3px_8px_rgba(163,177,198,0.4),_-3px_-3px_8px_rgba(255,255,255,0.85)]',
        'hover:text-[#1A1D23] hover:shadow-[6px_6px_14px_rgba(163,177,198,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)] hover:-translate-y-px',
        'active:shadow-[inset_3px_3px_8px_rgba(163,177,198,0.45),_inset_-3px_-3px_8px_rgba(255,255,255,0.9)] active:translate-y-0',
        'disabled:opacity-50',
        'border border-white/70',
    ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-3 py-1.5 text-xs gap-1 rounded-lg',
    sm: 'px-4 py-2 text-sm gap-1.5 rounded-xl',
    md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-7 py-3 text-base gap-2.5 rounded-2xl',
};

const Spinner = ({ size }: { size: ButtonSize }) => (
    <svg
        className={cn(
            'animate-spin shrink-0',
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
                    'inline-flex items-center justify-center font-medium',
                    'transition-all duration-200 ease-out',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6BED]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0F2F5]',
                    'disabled:cursor-not-allowed select-none',
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
