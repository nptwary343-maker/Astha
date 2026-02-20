export const runtime = 'edge';

import ShapeSelector from "@/components/admin/ShapeSelector";

export default function ShapeTestPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Shape Selector Demo
            </h1>
            <div className="max-w-6xl mx-auto">
                <ShapeSelector />
            </div>
        </div>
    );
}
