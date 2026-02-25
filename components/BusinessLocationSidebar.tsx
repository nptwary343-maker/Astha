'use client';

import React, { useEffect, useState } from 'react';
import { getBusinessLocations } from '@/lib/db-utils';
import { BusinessLocation } from '@/types/admin';
import { MapPin, ChevronRight, Navigation } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';

const BusinessLocationSidebar = () => {
    const [locations, setLocations] = useState<BusinessLocation[]>([]);
    const { selectedLocationId, setSelectedLocationId } = useLocation();

    useEffect(() => {
        const fetchLocations = async () => {
            const data = await getBusinessLocations();
            setLocations(data as BusinessLocation[]);
        };
        fetchLocations();
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="bg-blue-900 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Navigation size={18} className="text-orange-500" />
                    Business Locations
                </h3>
            </div>

            <div className="p-2 space-y-1">
                <button
                    onClick={() => setSelectedLocationId('all')}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${selectedLocationId === 'all'
                            ? 'bg-orange-50 border border-orange-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedLocationId === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <MapPin size={20} />
                    </div>
                    <div className="text-left">
                        <p className={`text-sm font-black ${selectedLocationId === 'all' ? 'text-orange-600' : 'text-blue-900'}`}>
                            All Bangladesh
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            Nationwide Delivery
                        </p>
                    </div>
                </button>

                {locations.map((loc) => (
                    <button
                        key={loc.id}
                        onClick={() => setSelectedLocationId(loc.id)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${selectedLocationId === loc.id
                                ? 'bg-orange-50 border border-orange-200'
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 ${selectedLocationId === loc.id ? 'border-orange-500' : 'border-gray-100'
                            }`}>
                            <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className={`text-sm font-black truncate ${selectedLocationId === loc.id ? 'text-orange-600' : 'text-blue-900'}`}>
                                {loc.name}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
                                {loc.area}, {loc.city}
                            </p>
                        </div>
                        <ChevronRight size={14} className={selectedLocationId === loc.id ? 'text-orange-500' : 'text-gray-300'} />
                    </button>
                ))}
            </div>

            <div className="p-4 bg-gray-50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center leading-relaxed">
                    Personalized shopping based on your nearest hub
                </p>
            </div>
        </div>
    );
};

export default BusinessLocationSidebar;
