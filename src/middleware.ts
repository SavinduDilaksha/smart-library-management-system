import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isRootPage = pathname === '/';

  // Allow public routes and API auth routes
  if (isPublicRoute || isApiAuthRoute) {
    // If already logged in, redirect to appropriate dashboard
    if (token) {
      const role = token.role as string;
      const dashboardUrl = getDashboardUrl(role);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
    return NextResponse.next();
  }

  // Root page redirect
  if (isRootPage) {
    if (token) {
      const role = token.role as string;
      return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected routes: redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Role-based route protection
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  if (pathname.startsWith('/staff') && role !== 'STAFF' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  if (pathname.startsWith('/user') && role !== 'MEMBER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard';
    case 'STAFF': return '/staff/dashboard';
    case 'MEMBER': return '/user/dashboard';
    default: return '/login';
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/admin/:path*',
    '/staff/:path*',
    '/user/:path*',
  ],
};
