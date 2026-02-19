'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, LayoutTemplate } from 'lucide-react';

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

export default function EditAboutPage() {
    const [content, setContent] = useState(defaultContent);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved content on mount
    useEffect(() => {
        const saved = localStorage.getItem('astharhat_about_content');
        if (saved) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setContent(JSON.parse(saved));
        }
         
        setIsLoaded(true);
    }, []);

    if (!isLoaded) return null;

    const handleSave = () => {
        localStorage.setItem('astharhat_about_content', JSON.stringify(content));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Reset to default content?')) {
            setContent(defaultContent);
            localStorage.removeItem('astharhat_about_content');
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage About Page</h1>
                    <p className="text-gray-500">Edit the content of the "About Us" page seen by customers.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <RefreshCw size={18} /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        {isSaved ? <span className="flex items-center gap-2">Saved!</span> : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Main Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-6 pb-2 border-b border-gray-50">
                        <LayoutTemplate size={20} className="text-blue-500" />
                        Hero Section
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Page Title</label>
                            <input
                                type="text"
                                value={content.title}
                                onChange={(e) => setContent({ ...content, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Main Description</label>
                            <textarea
                                value={content.description}
                                onChange={(e) => setContent({ ...content, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-50">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {content.features.map((feature, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                                <span className="absolute top-2 right-2 text-xs font-bold text-gray-300">#{index + 1}</span>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => {
                                            const newFeatures = [...content.features];
                                            newFeatures[index].title = e.target.value;
                                            setContent({ ...content, features: newFeatures });
                                        }}
                                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <textarea
                                        value={feature.text}
                                        onChange={(e) => {
                                            const newFeatures = [...content.features];
                                            newFeatures[index].text = e.target.value;
                                            setContent({ ...content, features: newFeatures });
                                        }}
                                        rows={2}
                                        className="w-full bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-50">Mission Statement</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={content.missionTitle}
                                onChange={(e) => setContent({ ...content, missionTitle: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mission Text</label>
                            <textarea
                                value={content.missionText}
                                onChange={(e) => setContent({ ...content, missionText: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-600"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
