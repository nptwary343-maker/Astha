'use client';
export const runtime = 'edge';;

import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Users, Headphones } from 'lucide-react';

const defaultContent = {
    title: 'About AstharHat',
    description: 'We are dedicated to providing the best quality electronics, groceries, and lifestyle products directly to your doorstep. Founded in 2024, AstharHat has quickly grown to become a trusted name in online shopping, prioritizing customer satisfaction and authentic products above all else.',
    missionTitle: 'Our Mission',
    missionText: '"To revolutionize the e-commerce experience by building trust and delivering happiness through every package we send."',
    features: [
        { title: 'Fast Delivery', text: 'Super fast delivery to all corners of the country within 48 hours.' },
        { title: 'Secure Payment', text: '100% secure payment methods with industry standard encryption.' },
        { title: '24/7 Support', text: 'Our dedicated support team is always ready to help you, day or night.' },
        { title: 'Premium Quality', text: 'We ensure that every product you receive is original and high quality.' },
    ]
};

export default function AboutPage() {
    const [content, setContent] = useState(defaultContent);
    const [isLoaded, setIsLoaded] = useState(false);

    // Simulate fetching CMS data
    useEffect(() => {
        const saved = localStorage.getItem('astharhat_about_content');
        if (saved) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(JSON.parse(saved));
        }
         
        setIsLoaded(true);
    }, []);

    if (!isLoaded) return null; // Or a skeleton loader

    const getIcon = (index: number) => {
        switch (index) {
            case 0: return <Truck size={32} />;
            case 1: return <ShieldCheck size={32} />;
            case 2: return <Users size={32} />;
            default: return <Headphones size={32} />;
        }
    };

    const getIconColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-orange-100 text-orange-600';
            case 1: return 'bg-blue-100 text-blue-600';
            case 2: return 'bg-green-100 text-green-600';
            default: return 'bg-purple-100 text-purple-600';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    {content.title}
                </h1>
                <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
                    {content.description}
                </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {content.features.map((feature, index) => (
                    <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                        <div className={`${getIconColor(index)} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110`}>
                            {getIcon(index)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-500">
                            {feature.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* Stats/Mission */}
            <div className="bg-gradient-to-r from-[#D94F1B] via-[#7B2E1D] to-[#2D0F0A] rounded-3xl p-10 md:p-16 text-center text-white shadow-xl shadow-orange-900/10">
                <h2 className="text-3xl font-bold mb-6">{content.missionTitle}</h2>
                <p className="text-xl opacity-90 max-w-4xl mx-auto leading-relaxed italic">
                    {content.missionText}
                </p>
            </div>
        </div>
    );
}
