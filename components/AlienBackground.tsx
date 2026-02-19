'use client';

import dynamic from 'next/dynamic';

// Dynamically import the canvas component with SSR disabled
const HighTechCanvas = dynamic(() => import('./HighTechCanvas'), { ssr: false });

export default function AlienBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000" />
            <HighTechCanvas />
        </div>
    );
}
