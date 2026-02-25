'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
    selectedLocationId: string;
    setSelectedLocationId: (id: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>('all');

    // Persistence in Local Storage
    useEffect(() => {
        const stored = localStorage.getItem('asthar_selected_location');
        if (stored) {
            setSelectedLocationId(stored);
        }
    }, []);

    const handleSetLocation = (id: string) => {
        setSelectedLocationId(id);
        localStorage.setItem('asthar_selected_location', id);
    };

    return (
        <LocationContext.Provider value={{ selectedLocationId, setSelectedLocationId: handleSetLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
