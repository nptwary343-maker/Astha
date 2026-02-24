import { NextResponse, type NextRequest } from 'next/server';
import { SECURITY_HEADERS, verifyZeroTrustToken } from '@/lib/security';

/**
 * 🔐 ZERO TRUST MIDDLEWARE ARCHITECTURE
 */

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    /* --- 🛡️ 1. SECURITY HEADERS INJECTION ---
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    }); */

    // --- 🔒 2. PROTECT ADMIN & DELIVERY ROUTES ---
    if (pathname.startsWith('/admin') || pathname.startsWith('/delivery')) {
        const adminToken = request.cookies.get('admin-session')?.value;
        const role = request.cookies.get('admin-role')?.value;

        // Zero Trust Rule: Strict Identity Verification
        const isTokenValid = verifyZeroTrustToken(adminToken);

        if (!adminToken || !role || !isTokenValid) {
            console.warn(`🚨 ZERO_TRUST_DENIAL: Identity verify failed for ${pathname}`);
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('reason', 'unauthorized');
            return NextResponse.redirect(loginUrl);
        }

        const isAdmin = ['admin', 'super_admin', 'super admin', 'manager'].includes(role);
        const isDelivery = role === 'delivery';

        // Role Validation Guard
        if (pathname.startsWith('/admin') && !isAdmin) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (pathname.startsWith('/delivery') && !isDelivery) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // --- 🔒 3. PROTECT USER ROUTES ---
    const protectedUserRoutes = ['/account', '/billing', '/tracking'];
    const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

    if (isProtectedUserRoute) {
        const userToken = request.cookies.get('user-session')?.value;
        const adminToken = request.cookies.get('admin-session')?.value;

        if (!userToken && !adminToken) {
            const url = new URL('/login', request.url);
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
