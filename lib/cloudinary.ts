
import imageCompression from 'browser-image-compression';

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
}

// 100% FREE NO-CREDIT-CARD CONFIG
// User should replace these with their own unsigned preset from Cloudinary Dashboard
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UNSIGNED_PRESET';

export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 0.1, // Max 100KB for faster free uploads
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp'
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Compression Error:", error);
        return file; // Fallback to original
    }
};

/**
 * Uploads an image to Cloudinary using the Unsigned Upload API.
 * This does not require a backend signature or credit card.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
        // 1. Compress for fastest transfer on free plan
        const compressedFile = await compressImage(file);

        // 2. Prepare Form Data for Unsigned Upload
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'asthar-hat-free-storage');

        // 3. Direct Browser Fetch to Cloudinary API
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Cloudinary Free Upload Error:", err);
            throw new Error(err.error?.message || 'Cloudinary upload failed');
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url; // Returns the optimized HTTPS URL

    } catch (error) {
        console.error("Cloudinary Integration Error:", error);
        throw error;
    }
};
