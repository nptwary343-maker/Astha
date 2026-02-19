'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (Server-Side Only)
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the public ID from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/demo/image/upload/v1614761234/folder/sample.jpg
 * Public ID: folder/sample (no extension)
 */
function getPublicIdFromUrl(url: string): string | null {
    try {
        if (!url || !url.includes('cloudinary.com')) return null;

        // Split by '/' and find the part after 'upload/v...'
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');

        if (uploadIndex === -1) return null;

        // Everything after 'upload' is relevant, but we might have versions (v12345)
        // Let's look for the version or just take everything after upload
        // Standard Cloudinary URL structure: .../upload/{version}/{folder}/{public_id}.{format}

        // We take parts from uploadIndex + 1
        const relevantParts = parts.slice(uploadIndex + 1);

        // If the first part starts with 'v' and is a number, it's version, skip it
        if (relevantParts[0]?.startsWith('v') && !isNaN(Number(relevantParts[0].substring(1)))) {
            relevantParts.shift();
        }

        // Rejoin the rest
        const fullPathWithExt = relevantParts.join('/');

        // Remove extension
        const dotIndex = fullPathWithExt.lastIndexOf('.');
        if (dotIndex !== -1) {
            return fullPathWithExt.substring(0, dotIndex);
        }

        return fullPathWithExt;

    } catch (error) {
        console.error("Error parsing Cloudinary URL:", error);
        return null;
    }
}

/**
 * Server Action to delete an image from Cloudinary by URL
 */
export async function deleteImageFromCloudinary(imageUrl: string) {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (!publicId) {
            console.warn("Could not extract public_id from URL:", imageUrl);
            return { success: false, error: "Invalid Cloudinary URL" };
        }

        console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);

        const result = await cloudinary.uploader.destroy(publicId, {
            invalidate: true // Clear CDN cache
        });

        if (result.result === 'ok') {
            return { success: true };
        } else {
            console.error("Cloudinary Delete Failed:", result);
            return { success: false, error: result.result };
        }

    } catch (error: any) {
        console.error("Cloudinary Deletion Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Bulk Delete Helper
 */
export async function deleteImagesFromCloudinary(imageUrls: string[]) {
    const results = await Promise.all(
        imageUrls.map(url => deleteImageFromCloudinary(url))
    );
    return results;
}
