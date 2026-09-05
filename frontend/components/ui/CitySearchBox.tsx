'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { cn } from '@/utils/cn';

interface CitySearchBoxProps {
    className?: string;
}

export function CitySearchBox({ className }: CitySearchBoxProps) {
    const { currentCity, setCity } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [cities, setCities] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCities = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/cities/active');
            if (res.data.success) {
                setCities(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load cities", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!isOpen && cities.length === 0) {
            fetchCities();
        }
        setIsOpen(!isOpen);
    };

    const filteredCities = cities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectCity = async (city: any) => {
        try {
            // Update on the backend securely
            await api.patch('/citizen/me/city', { cityId: city.id });
            setCity(city);
            setIsOpen(false);
            setSearchQuery('');
        } catch (err) {
            console.error(err);
            alert("Failed to switch city. The city may have become inactive.");
        }
    };

    if (!currentCity) return null;

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-100/50"
            >
                <MapPin className="w-4 h-4" />
                <span className="font-semibold text-sm">{currentCity.name}</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[9999] right-0 sm:left-0 sm:right-auto">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 relative">
                        <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search active cities..."
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="text-center text-sm text-slate-500 p-4">Loading cities...</div>
                        ) : filteredCities.length === 0 ? (
                            <div className="text-center text-sm text-slate-500 p-4">No active cities found matching '{searchQuery}'</div>
                        ) : (
                            filteredCities.map(city => (
                                <button
                                    key={city.id}
                                    onClick={() => selectCity(city)}
                                    className={cn(
                                        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group",
                                        currentCity.id === city.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"
                                    )}
                                >
                                    <div>
                                        <div className="font-semibold">{city.name}</div>
                                        <div className="text-xs opacity-70">{city.state}, {city.country}</div>
                                    </div>
                                    {currentCity.id === city.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Needed to silence check circle implicit import locally in the render logic above
import { CheckCircle2 } from 'lucide-react';
