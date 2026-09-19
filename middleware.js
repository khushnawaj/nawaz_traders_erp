import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';

// Paths that require authentication
const PROTECTED_PREFIXES = [
  '/parties',
  '/commodities',
  '/godowns',
  '/vehicles',
  '/employees',
  '/purchases',
  '/sales',
  '/expenses',
  '/reports',
  '/settings',
];

// Auth-only pages (redirect authenticated users away)
const AUTH_PAGES = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const isAuthPage = AUTH_PAGES.some((path) => pathname.startsWith(path));
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  let session = null;
  if (token) {
    session = await verifySessionToken(token);
  }

  // 1. Redirect unauthenticated users trying to access protected routes
  if (isProtectedPage && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users trying to access login/signup pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
