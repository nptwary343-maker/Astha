'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import { useMap } from 'react-leaflet/hooks';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { Locate, Loader2, Search } from 'lucide-react';

interface OSMMapPickerProps {
    onLocationSelect: (location: { lat: number; lng: number }) => void;
    radius?: number; // Radius in meters
}

// Sub-component to handle map movement
const MapFlyTo = ({ center }: { center: { lat: number, lng: number } }) => {
    const map = useMap(); // Correctly using useMap hook inside MapContainer
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, {
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
};

export default function OSMMapPicker({ onLocationSelect, radius = 1000 }: OSMMapPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [loadingLoc, setLoadingLoc] = useState(false);

    // Initial center: Dhaka
    const [viewCenter, setViewCenter] = useState({ lat: 23.8103, lng: 90.4125 });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };

                setPosition(newPos);
                setViewCenter(newPos);
                onLocationSelect(newPos);
            } else {
                alert("Location not found.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search location.");
        } finally {
            setSearching(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLoadingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                // High accuracy might be slow, but better.
                const newPos = { lat: latitude, lng: longitude };

                setPosition(newPos);
                setViewCenter(newPos);
                onLocationSelect(newPos);
                setLoadingLoc(false);
            },
            (err) => {
                console.error(err);
                // Fallback or specific error msg
                let msg = "Could not get your location.";
                if (err.code === 1) msg = "Location permission denied. Please allow location access.";
                else if (err.code === 2) msg = "Location unavailable. Check your GPS/Network.";
                else if (err.code === 3) msg = "Location request timed out.";

                alert(msg);
                setLoadingLoc(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                onLocationSelect(e.latlng);
            },
        });

        return position === null ? null : (
            <>
                <Marker position={position} />
                <Circle
                    center={position}
                    radius={radius} // Dynamic Radius
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                />
            </>
        );
    };

    return (
        <div className="relative h-[400px] w-full rounded-xl overflow-hidden group">
            {/* Search Input */}
            <div className="absolute top-4 left-4 right-16 z-[400]">
                <form onSubmit={handleSearch} className="relative shadow-lg max-w-sm">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search location (e.g. Dhanmondi)"
                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white/95 backdrop-blur-sm"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                    >
                        {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                </form>
            </div>

            {/* My Location Button */}
            <div className="absolute top-4 right-4 z-[400]">
                <button
                    onClick={handleGetLocation}
                    disabled={loadingLoc}
                    className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    title="Use My Location"
                >
                    {loadingLoc ? <Loader2 className="animate-spin" size={20} /> : <Locate size={20} />}
                </button>
            </div>

            <MapContainer
                key="osm-map-picker" // Add key to prevent reuse error
                center={viewCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
                <MapFlyTo center={viewCenter} />
            </MapContainer>

            {/* Instruction Overlay */}
            {!position && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-black/5 pointer-events-none flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 text-xs font-bold text-gray-600 animate-bounce">
                        Click on map or search to select location
                    </div>
                </div>
            )}
        </div>
    );
}
