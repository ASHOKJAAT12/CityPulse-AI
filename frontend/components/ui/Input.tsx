'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-surface-200 dark:text-surface-200">
                        {label}
                        {props.required && <span className="text-danger-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftElement && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                            {leftElement}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'input-base',
                            leftElement && 'pl-9',
                            rightElement && 'pr-9',
                            error && 'border-danger-500 focus:ring-danger-500',
                            className
                        )}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        aria-invalid={!!error}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                            {rightElement}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="text-xs text-danger-400 flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="text-xs text-surface-500">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';
