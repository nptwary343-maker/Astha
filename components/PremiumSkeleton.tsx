'use client';

import React from 'react';

interface PremiumSkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
}

const PremiumSkeleton = ({ className = '', variant = 'rectangular' }: PremiumSkeletonProps) => {
    const baseClasses = "relative overflow-hidden bg-gray-100 dark:bg-zinc-900";
    const variantClasses = variant === 'circular' ? 'rounded-full' : 'rounded-2xl';

    return (
        <div className={`${baseClasses} ${variantClasses} ${className}`}>
            {/* Premium Shimmer Sweep */}
            <div className="absolute inset-0 shimmer-premium opacity-10 dark:opacity-20 translate-x-[-100%]" />

            {/* Decorative Gold Pulse in skeleton */}
            <div className="absolute top-0 left-0 w-2 h-full bg-gold/10 blur-sm" />
        </div>
    );
};

export const ProductSkeleton = () => (
    <div className="glass-surface p-4 rounded-3xl border border-gray-50 dark:border-zinc-800">
        <PremiumSkeleton className="aspect-square w-full mb-4" />
        <PremiumSkeleton className="h-4 w-3/4 mb-2" variant="text" />
        <PremiumSkeleton className="h-3 w-1/2 mb-4" variant="text" />
        <div className="flex justify-between items-center">
            <PremiumSkeleton className="h-6 w-20" variant="text" />
            <PremiumSkeleton className="h-10 w-10" variant="circular" />
        </div>
    </div>
);

export default PremiumSkeleton;
