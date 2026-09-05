'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import { MapLayer } from './MapLayerControl';

export interface MapLegendProps {
    layers: MapLayer[];
    className?: string;
}

export function MapLegend({ layers, className }: MapLegendProps) {
    // Only show legend items for enabled layers
    const activeLayers = layers.filter(l => l.enabled);

    if (activeLayers.length === 0) return null;

    return (
        <div className={cn("bg-white/90 backdrop-blur-sm px-3 py-2 rounded shadow border border-slate-200 z-[1000] text-xs flex gap-4", className)}>
            <span className="font-semibold text-slate-600 border-r border-slate-300 pr-3 my-1">Legend</span>
            <div className="flex gap-4 flex-wrap items-center">
                {activeLayers.map(layer => (
                    <div key={layer.key} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: layer.color }}></span>
                        <span className="text-slate-700 font-medium">{layer.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
