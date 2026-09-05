'use client';
import React, { createContext, useContext, useState } from 'react';

// Exposes the Leaflet map instance generically so children can register layers/markers safely.
interface MapContextProps {
    map: any | null; // using any to prevent forcing specific Leaflet types statically
    setMap: (map: any) => void;
}

const MapContext = createContext<MapContextProps>({
    map: null,
    setMap: () => { },
});

export const useMap = () => useContext(MapContext);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
    const [map, setMap] = useState<any | null>(null);

    return (
        <MapContext.Provider value={{ map, setMap }}>
            {children}
        </MapContext.Provider>
    );
};
