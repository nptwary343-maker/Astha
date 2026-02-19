
import imageCompression from 'browser-image-compression';

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
}

export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 0.2, // Max 200KB
        maxWidthOrHeight: 1000,
        useWebWorker: true,
        fileType: 'image/webp'
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Compression Error:", error);
        throw error;
    }
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
        // 1. Compress
        const compressedFile = await compressImage(file);

        // 2. Get Signature
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const paramsToSign = {
            timestamp: timestamp,
            upload_preset: 'ml_default', // We'll use unsigned for simplicity first or signed if configured
            folder: 'asthar-hat-products'
        };

        // For secure signed uploads, we need to sign the parameters
        // However, to keep it robust and simple as per request (Serverless signing),
        // let's grab the signature from our API.

        // NOTE: For 'unsigned' presets, we don't need a signature.
        // But the user requested "Secure" which usually implies signed uploads.
        // Let's assume we are using a signed preset or standard signed upload.
        // If we use standard signed upload, we need API Key + Signature + Timestamp.

        const signResponse = await fetch('/api/cloudinary/sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paramsToSign: {
                    timestamp,
                    folder: 'asthar-hat-products'
                }
            })
        });

        if (!signResponse.ok) throw new Error('Failed to get signature');
        const { signature } = await signResponse.json();

        // 3. Upload
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', 'asthar-hat-products');

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Cloudinary Error:", err);
            throw new Error(err.error?.message || 'Upload failed');
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url;

    } catch (error) {
        console.error("Upload Flow Error:", error);
        throw error;
    }
};
