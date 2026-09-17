'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Search, CheckCircle2 } from 'lucide-react';
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
            console.error('Failed to load cities', error);
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
            await api.patch('/citizen/me/city', { cityId: city.id });
            setCity(city);
            setIsOpen(false);
            setSearchQuery('');
        } catch (err) {
            console.error(err);
            alert('Failed to switch city. The city may have become inactive.');
        }
    };

    if (!currentCity) return null;

    return (
        <div className={cn('relative', className)} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={toggleDropdown}
                className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#4F6BED]',
                    'bg-white border border-white/80 transition-all duration-200',
                    'shadow-[4px_4px_10px_rgba(163,177,198,0.5),_-4px_-4px_10px_rgba(255,255,255,0.9)]',
                    'hover:shadow-[6px_6px_14px_rgba(163,177,198,0.55),_-6px_-6px_14px_rgba(255,255,255,0.92)]',
                    'active:shadow-[inset_3px_3px_8px_rgba(163,177,198,0.45),_inset_-3px_-3px_8px_rgba(255,255,255,0.9)]',
                )}
            >
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentCity.name}</span>
                <ChevronDown className={cn('w-3.5 h-3.5 opacity-60 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute top-full mt-2 w-72 bg-white rounded-2xl overflow-hidden z-[9999]',
                        'right-0 sm:left-0 sm:right-auto',
                        'border border-white/80',
                        'shadow-[8px_8px_20px_rgba(163,177,198,0.5),_-8px_-8px_20px_rgba(255,255,255,0.92)]',
                        'animate-[fade-in_0.15s_ease-out]',
                    )}
                >
                    {/* Search Header */}
                    <div className="p-3 border-b border-[#DCE1EB]/50 relative">
                        <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-[#A8B0C0] pointer-events-none" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search cities..."
                            className="input-base pl-9 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* City List */}
                    <div className="max-h-[280px] overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="text-center text-sm text-[#A8B0C0] p-4">Loading cities...</div>
                        ) : filteredCities.length === 0 ? (
                            <div className="text-center text-sm text-[#A8B0C0] p-4">
                                No cities found matching &apos;{searchQuery}&apos;
                            </div>
                        ) : (
                            filteredCities.map(city => (
                                <button
                                    key={city.id}
                                    onClick={() => selectCity(city)}
                                    className={cn(
                                        'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center justify-between',
                                        currentCity.id === city.id
                                            ? 'bg-[#F0F2F5] shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4),_inset_-2px_-2px_5px_rgba(255,255,255,0.85)] text-[#4F6BED] font-semibold'
                                            : 'text-[#1A1D23] hover:bg-[#F7F8FA]'
                                    )}
                                >
                                    <div>
                                        <div className="font-medium">{city.name}</div>
                                        <div className="text-xs text-[#A8B0C0]">{city.state}, {city.country}</div>
                                    </div>
                                    {currentCity.id === city.id && (
                                        <CheckCircle2 className="w-4 h-4 text-[#4F6BED] shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
