'use client';

import { useState } from 'react';
import { uploadToCloudinary, compressImage } from '@/lib/cloudinary';
import { Loader2 } from 'lucide-react';

export default function CloudinaryTestPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('Idle');
    const [result, setResult] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('File Selected');
            setResult(null);
        }
    };

    const runTest = async () => {
        if (!file) return;

        setIsUploading(true);
        setStatus('Starting Test...');
        setResult(null);

        const startTime = performance.now();

        try {
            // 1. Test Compression
            setStatus('Compressing...');
            const compressed = await compressImage(file);

            // 2. Test Upload
            setStatus('Uploading...');
            const url = await uploadToCloudinary(file); // This does compression again internally, but that's fine for test

            const endTime = performance.now();

            setResult({
                originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                compressedSize: (compressed.size / 1024 / 1024).toFixed(2) + ' MB',
                url: url,
                timeTaken: ((endTime - startTime) / 1000).toFixed(2) + 's'
            });
            setStatus('Success!');

        } catch (error: any) {
            console.error(error);
            setStatus('Failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-10 max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Cloudinary Integration Test</h1>

            <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl">
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100
                "/>
            </div>

            <button
                onClick={runTest}
                disabled={!file || isUploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
            >
                {isUploading && <Loader2 className="animate-spin" />}
                {isUploading ? 'Testing...' : 'Run Upload Test'}
            </button>

            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                <p>Status: <span className="font-bold">{status}</span></p>
            </div>

            {result && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-800 mb-2">Test Results</h3>
                    <ul className="space-y-1 text-sm">
                        <li>Original: {result.originalSize}</li>
                        <li>Compressed: {result.compressedSize} (Expected &lt; 0.2 MB)</li>
                        <li>Time: {result.timeTaken}</li>
                        <li>URL: <a href={result.url} target="_blank" className="text-blue-600 underline truncate block">{result.url}</a></li>
                    </ul>
                    <img src={result.url} alt="Uploaded" className="mt-4 w-32 h-32 object-cover rounded-lg border" />
                </div>
            )}
        </div>
    );
}
