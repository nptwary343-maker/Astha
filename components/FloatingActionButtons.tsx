'use client';

import { Phone, ShoppingCart, Truck } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function FloatingActionButtons() {
    const [phone, setPhone] = useState('+8801900000000');

    useEffect(() => {
        const savedPhone = localStorage.getItem('store_phone');
        if (savedPhone) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPhone(savedPhone);
        }
    }, []);

    return (
        <div className="fixed bottom-24 md:bottom-10 right-6 z-[100] flex flex-col gap-4">
            {/* Tracking Button */}
            <Link
                href="/tracking"
                className="bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:scale-110 transition-transform flex items-center justify-center group relative h-14 w-14"
                title="Track My Order"
            >
                <Truck size={24} fill="none" />
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none border border-gray-700">
                    Track My Order
                </span>
            </Link>

            {/* Quick Order / Call Button */}
            <a
                href={`tel:${phone}`}
                className="bg-green-500 text-white p-4 rounded-full shadow-lg shadow-green-200 hover:scale-110 transition-transform flex items-center justify-center group relative h-14 w-14 animate-bounce-slow"
                title="Call to Order"
            >
                <Phone size={24} fill="currentColor" />
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none border border-gray-700">
                    Call to Order
                </span>
            </a>
        </div>
    );
}

