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

const statusConfig: Record<ServiceStatus, { label: string, color: string, icon: React.ReactNode, bg: string }> = {
    NORMAL: { label: 'Normal', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
    WARNING: { label: 'Warning', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <AlertCircle className="w-4 h-4 text-amber-600" /> },
    CRITICAL: { label: 'Critical', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: <XCircle className="w-4 h-4 text-rose-600" /> },
    NOT_AVAILABLE: { label: 'Not Available', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', icon: <Clock className="w-4 h-4 text-slate-400" /> },
}

export function ServiceCard({ title, icon, status, message, className }: ServiceCardProps) {
    const config = statusConfig[status];

    return (
        <div className={cn("p-4 rounded-xl border flex flex-col gap-3 transition-shadow hover:shadow-sm", config.bg, className)}>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    {icon}
                </div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
            </div>

            <div className="mt-auto">
                <div className="flex items-center gap-1.5 mb-1">
                    {config.icon}
                    <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
                </div>
                {message && (
                    <p className="text-xs text-slate-500 line-clamp-2">{message}</p>
                )}
            </div>
        </div>
    );
}
