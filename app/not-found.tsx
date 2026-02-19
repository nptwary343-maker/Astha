import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h2 className="text-4xl font-extrabold text-orange-600 mb-4">404</h2>
            <p className="text-gray-600 text-lg mb-8">Could not find requested resource</p>
            <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                Return Home
            </Link>
        </div>
    )
}
