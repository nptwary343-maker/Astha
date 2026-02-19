'use client';

import { Loader2, RefreshCw } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <div className="text-center">
                    <p className="text-sm text-gray-500 font-medium animate-pulse mb-2">Loading...</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 mx-auto"
                    >
                        <RefreshCw size={12} /> Reload Page
                    </button>
                </div>
            </div>
        </div>
    );
}
