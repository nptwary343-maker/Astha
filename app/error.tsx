'use client';
export const runtime = 'edge';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
                Try again
            </button>
        </div>
    );
}
