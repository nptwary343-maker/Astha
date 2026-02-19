'use client';

import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function ImportDataPage() {
    const [isDragging, setIsDragging] = useState(false);

    const handleDownloadTemplate = (e: React.MouseEvent) => {
        e.preventDefault();

        // CSV Headers
        const headers = ['Name', 'Price', 'Category', 'Stock', 'Description', 'ImageURL'];
        // Optional: Add a sample row (commented out or empty to just give headers)
        const sampleRow = ['Sample Product', '1500', 'Electronics', '50', 'Great product description', 'https://example.com/image.jpg'];

        const csvContent = [
            headers.join(','),
            sampleRow.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'product_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-gray-900">Import Data</h1>
                <p className="text-gray-500 text-lg">Upload CSV or Excel files to bulk import products or orders.</p>
            </div>

            <div
                className={`bg-white rounded-3xl border-2 border-dashed transition-all p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[400px]
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); alert('File drop simulation'); }}
            >
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                    <UploadCloud size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & Drop file here</h3>
                <p className="text-gray-500 mb-8">or click to browse from your computer</p>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
                    Select File
                </button>

                <p className="mt-8 text-xs text-gray-400 uppercase font-bold tracking-widest">Supports: CSV, XLXS, JSON</p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                    <h4 className="font-bold text-orange-800">Important Note</h4>
                    <p className="text-orange-700 mt-1">
                        Please ensure your CSV file follows the correct template format. Columns must be matched exactly for successful import.
                        <button onClick={handleDownloadTemplate} className="underline font-bold ml-1 hover:text-orange-900">
                            Download Template
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
