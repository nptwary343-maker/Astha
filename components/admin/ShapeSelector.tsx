"use client";

import React, { useState } from "react";

interface Shape {
    id: string;
    name: string;
    css: string;
    type: "radius" | "clip-path";
}

const shapes: Shape[] = [
    {
        id: "organic1",
        name: "Organic 1",
        css: "60% 40% 30% 70% / 60% 30% 70% 40%",
        type: "radius",
    },
    {
        id: "organic2",
        name: "Organic 2",
        css: "30% 70% 70% 30% / 30% 30% 70% 70%",
        type: "radius",
    },
    {
        id: "organic3",
        name: "Organic 3",
        css: "50% 50% 20% 80% / 25% 80% 20% 75%",
        type: "radius",
    },
    {
        id: "organic4",
        name: "Organic 4",
        css: "70% 30% 30% 70% / 60% 40% 60% 40%",
        type: "radius",
    },
    {
        id: "organic5",
        name: "Organic 5",
        css: "40% 60% 60% 40% / 60% 30% 70% 40%",
        type: "radius",
    },
    {
        id: "wavy1",
        name: "Wavy",
        // Jagged/Burst shape using polygon
        css: "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)",
        type: "clip-path",
    },
];

const ShapeSelector = () => {
    const [selectedShape, setSelectedShape] = useState<Shape>(shapes[0]);

    return (
        <div className="flex flex-col md:flex-row gap-8 p-8 items-start">
            {/* Controls */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Choose Shape</h3>
                <div className="grid grid-cols-2 gap-3">
                    {shapes.map((shape) => (
                        <button
                            key={shape.id}
                            onClick={() => setSelectedShape(shape)}
                            className={`p-3 text-sm font-medium rounded-lg transition-all duration-200 border-2 ${selectedShape.id === shape.id
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                : "border-gray-100 hover:border-blue-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {shape.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="flex-1 w-full flex justify-center items-center bg-gray-50 p-10 rounded-3xl min-h-[500px]">
                <div
                    className="relative w-80 h-80 shadow-2xl transition-all duration-500 ease-in-out flex flex-col items-center justify-center text-center p-6"
                    style={{
                        borderRadius:
                            selectedShape.type === "radius" ? selectedShape.css : "0",
                        clipPath:
                            selectedShape.type === "clip-path" ? selectedShape.css : "none",
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Overlay for better text readability */}
                    <div
                        className="absolute inset-0 bg-black/20 transition-all duration-500"
                        style={{
                            borderRadius:
                                selectedShape.type === "radius" ? selectedShape.css : "0",
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 text-white">
                        <h2 className="text-3xl font-bold mb-2 drop-shadow-md">
                            Dynamic Shape
                        </h2>
                        <p className="text-base font-medium opacity-90 drop-shadow-sm">
                            {selectedShape.name}
                        </p>
                        <button className="mt-6 px-6 py-2 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                            Shop Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShapeSelector;
