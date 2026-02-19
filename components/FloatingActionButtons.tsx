'use client';

import { Phone, ShoppingCart } from 'lucide-react';
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
            {/* Quick Order / Call Button */}
            <a
                href={`tel:${phone}`}
                className="bg-green-500 text-white p-4 rounded-full shadow-lg shadow-green-200 hover:scale-110 transition-transform flex items-center justify-center animate-bounce-slow"
                title="Call to Order"
            >
                <Phone size={24} fill="currentColor" />
            </a>

            {/* Quick Cart Button (Mobile Only) */}

        </div>
    );
}
