
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
    // 💡 Performance Tip: 0.2MB is a better balance than 0.1MB for the free plan
    const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8
    };

    console.log(`📸 [COMPRESSION] Starting: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    try {
        // Add a race condition to prevent "hanging" forever
        const compressionPromise = imageCompression(file, options);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Compression Timeout")), 15000)
        );

        const compressedFile = await Promise.race([compressionPromise, timeoutPromise]) as File;
        console.log(`✅ [COMPRESSION] Done: ${(compressedFile.size / 1024).toFixed(1)} KB`);
        return compressedFile;
    } catch (error) {
        console.warn("⚠️ [COMPRESSION] Failed or Timed out. Using original file.", error);
        return file; // Fallback to original if compression hangs or fails
    }
};

/**
 * 🚀 DIRECT CLOUDINARY UPLOAD (Browser-Side)
 * Uploads directly to Cloudinary using an unsigned preset.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUD_NAME || CLOUD_NAME === 'YOUR_CLOUD_NAME') {
        throw new Error("Cloudinary Cloud Name is not configured.");
    }

    try {
        // 1. Compress
        const compressedFile = await compressImage(file);

        // 2. Prepare Form Data
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'asthar-hat-free-storage');

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        console.log(`📤 [CLOUDINARY] Uploading to ${CLOUD_NAME}...`);

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ [CLOUDINARY] API Error:", errorData);
            throw new Error(errorData.error?.message || "Upload failed");
        }

        const data: CloudinaryResponse = await response.json();
        console.log("✅ [CLOUDINARY] Upload Successful:", data.secure_url);
        return data.secure_url;
    } catch (error: any) {
        console.error("🚨 [CLOUDINARY] Critical Upload Failure:", error);
        throw error;
    }
};
