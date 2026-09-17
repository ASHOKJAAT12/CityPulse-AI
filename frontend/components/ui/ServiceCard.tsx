import React from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

export type ServiceStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NOT_AVAILABLE';

export interface ServiceCardProps {
    title: string;
    icon: React.ReactNode;
    status: ServiceStatus;
    message?: string;
    className?: string;
}

const statusConfig: Record<ServiceStatus, { label: string; textColor: string; dotColor: string; icon: React.ReactNode }> = {
    NORMAL: {
        label: 'Normal',
        textColor: 'text-green-600',
        dotColor: 'bg-green-500',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
    },
    WARNING: {
        label: 'Warning',
        textColor: 'text-amber-600',
        dotColor: 'bg-amber-500',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
    },
    CRITICAL: {
        label: 'Critical',
        textColor: 'text-red-600',
        dotColor: 'bg-red-500',
        icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    },
    NOT_AVAILABLE: {
        label: 'Unavailable',
        textColor: 'text-[#A8B0C0]',
        dotColor: 'bg-[#C8D0DF]',
        icon: <Clock className="w-3.5 h-3.5 text-[#A8B0C0]" />,
    },
};

export function ServiceCard({ title, icon, status, message, className }: ServiceCardProps) {
    const config = statusConfig[status];

    return (
        <div
            className={cn(
                'bg-white rounded-2xl p-4 flex flex-col gap-3',
                'border border-white/80',
                'shadow-[6px_6px_14px_rgba(163,177,198,0.5),_-6px_-6px_14px_rgba(255,255,255,0.92)]',
                'transition-all duration-200',
                'hover:shadow-[8px_8px_18px_rgba(163,177,198,0.55),_-8px_-8px_18px_rgba(255,255,255,0.92)] hover:-translate-y-0.5',
                className
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    'shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.85)]',
                    'bg-[#F0F2F5]',
                )}
            >
                {icon}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-[#1A1D23] text-sm leading-tight">{title}</h3>

            {/* Status */}
            <div className="mt-auto space-y-1">
                <div className="flex items-center gap-1.5">
                    {config.icon}
                    <span className={cn('text-xs font-semibold', config.textColor)}>{config.label}</span>
                </div>
                {message && (
                    <p className="text-xs text-[#A8B0C0] line-clamp-2 leading-relaxed">{message}</p>
                )}
            </div>
        </div>
    );
}
