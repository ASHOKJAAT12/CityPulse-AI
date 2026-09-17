'use client';
import React, { useEffect, useState } from 'react';
import { Marker, Popup } from './index';
import api from '../../services/api';

interface ReportsLayerProps {
    /** citizen view: fetch /reports/city/my  |  admin view: fetch /reports/admin */
    mode?: 'citizen' | 'admin';
    cityId?: string;
}

const SEVERITY_COLOR: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#d97706',
    LOW: '#16a34a',
};

const STATUS_BADGE: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    VERIFIED: 'bg-indigo-100 text-indigo-700',
    ASSIGNED: 'bg-orange-100 text-orange-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-zinc-100 text-zinc-600',
    REJECTED: 'bg-red-100 text-red-700',
};

export function ReportsLayer({ mode = 'citizen', cityId }: ReportsLayerProps) {
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const fetchReports = async () => {
            if (!cityId) return; // Wait until cityId is available
            try {
                const endpoint = mode === 'admin' ? '/reports/admin' : '/reports/city';
                const res = await api.get(endpoint, { params: { limit: 100, cityId } });
                if (res.data?.data) {
                    setReports(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load citizen reports for map', err);
            }
        };
        fetchReports();
    }, [mode, cityId]);

    if (!reports.length) return null;

    return (
        <>
            {reports.map((report: any) => {
                const lng = report.location?.coordinates?.[0];
                const lat = report.location?.coordinates?.[1];
                if (!lat || !lng) return null;

                const severity = report.severity || 'MEDIUM';
                const color = SEVERITY_COLOR[severity] || '#f97316';
                const statusClass = STATUS_BADGE[report.status] || 'bg-gray-100 text-gray-600';

                return (
                    <Marker
                        key={report._id}
                        position={{ lat, lng }}
                        label={report.title}
                        icon="alert"
                        color={color}
                        popup={
                            <div className="min-w-[220px] p-1 font-sans">
                                <div className="flex items-start gap-2 mb-2 pb-2 border-b border-slate-100">
                                    <div
                                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight m-0">
                                            {report.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 m-0">
                                            #{report.reportNumber} · {report.category}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                                        {report.status?.replace('_', ' ')}
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color }}>
                                        {severity}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed m-0 line-clamp-3">
                                    {report.description}
                                </p>

                                <p className="text-[10px] text-slate-400 mt-2 m-0">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        }
                    />
                );
            })}
        </>
    );
}
