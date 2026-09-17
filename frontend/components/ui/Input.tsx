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
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[#1A1D23]"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftElement && (
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8B0C0] pointer-events-none">
                            {leftElement}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'input-base',
                            leftElement && 'pl-10',
                            rightElement && 'pr-10',
                            error && [
                                'border-red-300/60',
                                'shadow-[inset_2px_2px_6px_rgba(239,68,68,0.1),_inset_-2px_-2px_6px_rgba(255,255,255,0.9)]',
                                'focus:ring-red-400/20 focus:border-red-300/60',
                            ],
                            className
                        )}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        aria-invalid={!!error}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8B0C0]">
                            {rightElement}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <span>⚠</span> {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="text-xs text-[#A8B0C0] mt-1">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';
