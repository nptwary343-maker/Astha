import { NextResponse, type NextRequest } from 'next/server';
import { SECURITY_HEADERS, verifyZeroTrustToken } from '@/lib/security';

/**
 * 🔐 ZERO TRUST MIDDLEWARE ARCHITECTURE
 */

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // --- 🛡️ 1. SECURITY HEADERS INJECTION ---
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // --- 🔒 2. PROTECT ADMIN & DELIVERY ROUTES ---
    if (pathname.startsWith('/admin') || pathname.startsWith('/delivery')) {
        const adminToken = request.cookies.get('admin-session')?.value;
        const role = request.cookies.get('admin-role')?.value;

        // Zero Trust Rule 1: Strict Identity Verification & Fail Early
        if (!adminToken || !role) {
            console.warn(`🚨 ZERO_TRUST_DENIAL [MISSING_CREDENTIALS]: Access denied for ${pathname}`);
            return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
        }

        const isTokenValid = verifyZeroTrustToken(adminToken);
        if (!isTokenValid) {
            console.error(`🚨 ZERO_TRUST_BREACH_ATTEMPT [INVALID_TOKEN]: Rejecting spoofed token for ${pathname}`);
            // 🛡️ Force clearing of potentially malicious cookies
            const redirectParams = new URL('/login?reason=security_breach', request.url);
            const redirectResponse = NextResponse.redirect(redirectParams);
            redirectResponse.cookies.delete('admin-session');
            redirectResponse.cookies.delete('admin-role');
            return redirectResponse;
        }

        // Zero Trust Rule 2: Least Privilege (Role validation is only checked after token is validated)
        const isAdmin = ['admin', 'super_admin', 'super admin', 'manager'].includes(role);
        const isDelivery = role === 'delivery';

        if (pathname.startsWith('/admin') && !isAdmin) {
            console.warn(`🚨 ZERO_TRUST_DENIAL [ROLE_MISMATCH_ADMIN]: Rejecting ${pathname}`);
            return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
        }

        if (pathname.startsWith('/delivery') && !isDelivery) {
            console.warn(`🚨 ZERO_TRUST_DENIAL [ROLE_MISMATCH_DELIVERY]: Rejecting ${pathname}`);
            return NextResponse.redirect(new URL('/login?reason=unauthorized', request.url));
        }
    }

    // --- 🔒 3. PROTECT USER ROUTES ---
    const protectedUserRoutes = ['/account', '/billing', '/tracking'];
    const isProtectedUserRoute = protectedUserRoutes.some(route => pathname.startsWith(route));

    if (isProtectedUserRoute) {
        const userToken = request.cookies.get('user-session')?.value;
        const adminToken = request.cookies.get('admin-session')?.value;

        // Enforce token verification for regular users too
        const isUserValid = userToken ? verifyZeroTrustToken(userToken) : false;
        const isAdminValid = adminToken ? verifyZeroTrustToken(adminToken) : false;

        if (!isUserValid && !isAdminValid) {
            console.warn(`🚨 ZERO_TRUST_USER_DENIAL: Identity verify failed for ${pathname}`);
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
