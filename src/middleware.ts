import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth'; // Ensure this matches your utils path

// Paths that do not require authentication
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/logout'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip public paths and static assets
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file extensions like .ico, .png
  ) {
    return NextResponse.next();
  }

  // 2. Check for the Session Token (Cookie)
  // Ensure your Login API sets a cookie named 'token' or 'session'
  const token = req.cookies.get('token')?.value || req.cookies.get('session')?.value;

  // 3. Verify Token
  if (!token) {
    // No token? Redirect to login
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const payload = await verifyJwt(token);
    
    if (!payload) {
      // Invalid token? Redirect to login
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // 4. (Optional) Force Password Reset Check via Middleware
    // If you encode 'passwordResetRequired' in your JWT, you can redirect here.
    // if (payload.passwordResetRequired && !pathname.startsWith('/auth/new-password')) {
    //    return NextResponse.redirect(new URL('/auth/new-password', req.url));
    // }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

// Apply to everything except specifically excluded paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
