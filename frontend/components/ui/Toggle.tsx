'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    labelPosition?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    id?: string;
}

const sizeConfig = {
    sm: {
        track:  'w-9 h-5',
        knob:   'w-3.5 h-3.5',
        translate: 'translate-x-4',
        label:  'text-xs',
    },
    md: {
        track:  'w-12 h-6',
        knob:   'w-4.5 h-4.5',
        translate: 'translate-x-6',
        label:  'text-sm',
    },
    lg: {
        track:  'w-14 h-7',
        knob:   'w-5 h-5',
        translate: 'translate-x-7',
        label:  'text-base',
    },
};

export function Toggle({
    checked,
    onChange,
    label,
    labelPosition = 'right',
    size = 'md',
    disabled = false,
    className,
    id,
}: ToggleProps) {
    const cfg = sizeConfig[size];
    const toggleId = id ?? (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
        <div
            className={cn(
                'inline-flex items-center gap-3',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {label && labelPosition === 'left' && (
                <label
                    htmlFor={toggleId}
                    className={cn('font-medium text-[#1A1D23] cursor-pointer select-none', cfg.label, disabled && 'cursor-not-allowed')}
                >
                    {label}
                </label>
            )}

            {/* Track */}
            <button
                id={toggleId}
                role="switch"
                type="button"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    'relative rounded-full transition-all duration-300 ease-in-out focus:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-[#4F6BED]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F0F2F5]',
                    cfg.track,
                    // Track: OFF state — subtle inset
                    !checked && [
                        'bg-[#F0F2F5]',
                        'shadow-[inset_3px_3px_7px_rgba(163,177,198,0.5),_inset_-3px_-3px_7px_rgba(255,255,255,0.9)]',
                    ],
                    // Track: ON state — slightly tinted inset
                    checked && [
                        'bg-[#EEF1FD]',
                        'shadow-[inset_3px_3px_7px_rgba(163,177,198,0.45),_inset_-3px_-3px_7px_rgba(255,255,255,0.9)]',
                    ],
                    disabled && 'cursor-not-allowed',
                )}
            >
                {/* Knob */}
                <span
                    aria-hidden="true"
                    className={cn(
                        'absolute top-1/2 -translate-y-1/2 rounded-full bg-white',
                        'transition-all duration-300 ease-in-out',
                        // Knob shadow — raised feel
                        'shadow-[3px_3px_7px_rgba(163,177,198,0.55),_-2px_-2px_5px_rgba(255,255,255,0.95)]',
                        cfg.knob,
                        // Position
                        checked ? [cfg.translate, '!shadow-[3px_3px_7px_rgba(79,107,237,0.25),_-2px_-2px_5px_rgba(255,255,255,0.9)]'] : 'translate-x-0.5',
                    )}
                />

                {/* ON indicator dot */}
                {checked && (
                    <span
                        aria-hidden="true"
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4F6BED] opacity-60"
                    />
                )}
            </button>

            {label && labelPosition === 'right' && (
                <label
                    htmlFor={toggleId}
                    className={cn('font-medium text-[#1A1D23] cursor-pointer select-none', cfg.label, disabled && 'cursor-not-allowed')}
                >
                    {label}
                </label>
            )}
        </div>
    );
}
