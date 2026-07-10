import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths:
  // 1. /login
  // 2. /receipt (digital receipts must be public)
  // 3. Static assets, API routes, Next.js internals
  if (
    pathname === '/login' ||
    pathname.startsWith('/receipt') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Exclude files like logo.jpg, favicon.ico
  ) {
    return NextResponse.next();
  }

  // Check for our custom auth cookie
  const authToken = request.cookies.get('sfg_admin_auth');

  // If no auth token, redirect to login page
  if (!authToken || authToken.value !== 'true') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only run middleware on all routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
