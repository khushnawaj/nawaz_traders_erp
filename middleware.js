import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';

// Protected ERP management pages
const MANAGEMENT_PAGES = [
  '/farmers',
  '/parties',
  '/commodities',
  '/godowns',
  '/vehicles',
  '/employees',
  '/purchases',
  '/sales',
  '/investors',
  '/expenses',
  '/reports',
];

// Auth pages
const AUTH_PAGES = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  let session = null;
  if (token) {
    session = await verifySessionToken(token);
  }

  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path));
  const isProtectedPage = 
    MANAGEMENT_PAGES.some((prefix) => pathname.startsWith(prefix)) || 
    pathname.startsWith('/portal') || 
    pathname.startsWith('/settings');

  // 1. Unauthenticated users: redirect to /login for protected pages (e.g. /farmers, /sales, /investors)
  if (isProtectedPage && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users: redirect away from /login & /signup
  if (isAuthPage && session) {
    if (session.role === 'FARMER') {
      return NextResponse.redirect(new URL('/portal/farmer', request.url));
    }
    if (['EMPLOYEE', 'DRIVER'].includes(session.role)) {
      return NextResponse.redirect(new URL('/portal/employee', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. FARMER Role restriction: ONLY allowed on /portal/farmer, /settings, /api/...
  if (session && session.role === 'FARMER') {
    const isAllowed = pathname.startsWith('/portal/farmer') || pathname.startsWith('/settings') || pathname.startsWith('/api');
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/portal/farmer', request.url));
    }
  }

  // 4. EMPLOYEE & DRIVER Role restriction: ONLY allowed on /portal/employee, /settings, /api/...
  if (session && ['EMPLOYEE', 'DRIVER'].includes(session.role)) {
    const isAllowed = pathname.startsWith('/portal/employee') || pathname.startsWith('/settings') || pathname.startsWith('/api');
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/portal/employee', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
