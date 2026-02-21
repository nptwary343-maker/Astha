'use server';

/**
 * extracts the public ID from a Cloudinary URL.
 */
function getPublicIdFromUrl(url: string): string | null {
    try {
        if (!url || !url.includes('cloudinary.com')) return null;
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        if (uploadIndex === -1) return null;
        const relevantParts = parts.slice(uploadIndex + 1);
        if (relevantParts[0]?.startsWith('v') && !isNaN(Number(relevantParts[0].substring(1)))) {
            relevantParts.shift();
        }
        const fullPathWithExt = relevantParts.join('/');
        const dotIndex = fullPathWithExt.lastIndexOf('.');
        if (dotIndex !== -1) return fullPathWithExt.substring(0, dotIndex);
        return fullPathWithExt;
    } catch (error) {
        console.error("Error parsing Cloudinary URL:", error);
        return null;
    }
}

/**
 * 🔐 Helper: Generate Cloudinary Signature (Edge Compatible)
 */
async function generateSignature(params: Record<string, any>) {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is missing");

    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&') + apiSecret;

    const msgBuffer = new TextEncoder().encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 🗑️ Server Action to delete an image from Cloudinary (Edge Optimized)
 */
export async function deleteImageFromCloudinary(imageUrl: string) {
    try {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (!publicId) return { success: false, error: "Invalid URL" };

        const timestamp = Math.round((new Date()).getTime() / 1000);
        const params = { public_id: publicId, timestamp };
        const signature = await generateSignature(params);

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey!);
        formData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Delete failed');
        }

        const result = await response.json();
        return { success: result.result === 'ok' };

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

