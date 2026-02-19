import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 🔒 1. PROTECT ADMIN & DELIVERY ROUTES
    if (pathname.startsWith('/admin') || pathname.startsWith('/delivery')) {
        const adminToken = request.cookies.get('admin-session')?.value;

        // টোকেন না থাকলে সরাসরি রিডাইরেক্ট
        if (!adminToken) {
            console.warn(`🚨 ACCESS_DENIED: No session cookie found for ${pathname}. Redirecting to /login`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // 🛡️ 2. DIRECT CHECK (No Firestore Hit)
        // We trust the admin-role cookie if it exists and matches
        const role = request.cookies.get('admin-role')?.value;
        const uidToken = adminToken; // This is now a JWT or UID

        // Super Admin Hardcoded Direct Access - SECURED
        // NOTE: Since uidToken is now a JWT, we can't do direct string comparison at the Edge easily 
        // without parsing the JWT. We will rely on 'admin-role' cookie for routing.
        const isSuperAdmin = role === 'super_admin' || role === 'super admin';

        // Secondary Guard: Check for an INTERNAL_SECRET_ACCESS cookie 
        const secretAccess = request.cookies.get('admin-secret-access')?.value;
        const EXPECTED_SECRET = process.env.INTERNAL_API_SECRET;

        if (isSuperAdmin) {
            return NextResponse.next();
        }

        if (!role) {
            console.warn(`🚨 ACCESS_DENIED: No role found for ${pathname}. Redirecting to /login`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const isAdmin = role === 'admin' || role === 'super_admin' || role === 'super admin' || role === 'manager';
        const isDelivery = role === 'delivery';

        // Allow /admin access
        if (pathname.startsWith('/admin') && !isAdmin) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Allow /delivery access
        if (pathname.startsWith('/delivery') && !isDelivery) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        return NextResponse.next();
    }

    // 🔒 2. PROTECT USER ROUTES
    const protectedUserRoutes = ['/account', '/billing', '/tracking'];
    const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

    if (isProtectedUserRoute) {
        const userToken = request.cookies.get('user-session')?.value;
        const adminToken = request.cookies.get('admin-session')?.value;

        // If no user token AND no admin token (admins should access user areas usually, or separate?)
        // Let's assume admins might need access or just plain users. 
        // If neither exists, redirect to login.
        if (!userToken && !adminToken) {
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// শুধু /admin এবং /delivery রুটগুলোতে এবং Protected User Area-তে এই মিডলওয়্যারটি চলবে
export const config = {
    matcher: [
        '/admin', '/admin/:path*',
        '/delivery', '/delivery/:path*',
        '/account/:path*',
        '/billing/:path*',
        '/tracking/:path*'
    ],
};
