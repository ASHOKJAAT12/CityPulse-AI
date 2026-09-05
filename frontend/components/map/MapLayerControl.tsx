'use client';
import React from 'react';
import { cn } from '@/utils/cn';

export interface MapLayer {
    key: string;
    label: string;
    color: string;
    enabled: boolean;
    available: boolean; // false for Phase 3 placeholders
}

export interface MapLayerControlProps {
    layers: MapLayer[];
    onChange: (key: string, enabled: boolean) => void;
    className?: string;
}

export function MapLayerControl({ layers, onChange, className }: MapLayerControlProps) {
    return (
        <div className={cn("bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 z-[1000] max-w-sm", className)}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Map Layers</h3>
            <div className="space-y-2">
                {layers.map(layer => (
                    <label key={layer.key} className={cn(
                        "flex items-center gap-3 p-2 rounded transition-colors cursor-pointer",
                        layer.available ? "hover:bg-slate-100" : "opacity-50 cursor-not-allowed"
                    )}>
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                            checked={layer.enabled}
                            disabled={!layer.available}
                            onChange={(e) => onChange(layer.key, e.target.checked)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }}></span>
                            <span className="text-sm font-medium text-slate-700">{layer.label}</span>
                        </div>
                        {!layer.available && (
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
                        )}
                    </label>
                ))}
            </div>
        </div>
    );
}
