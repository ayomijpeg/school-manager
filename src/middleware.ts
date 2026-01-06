import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth'; 

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/new-password', // Add this (user needs to set password after setup)
  '/setup',             // Add this (CRITICAL: you need to create the admin account)
  '/api/auth/login',
  '/api/auth/logout',
  '/api/setup'          // Allow the setup API too
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip public paths, static assets, AND THE LANDING PAGE
  if (
    pathname === '/' || // 🟢 FIX: Explicitly allow the landing page
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check for Token
  const token = req.cookies.get('token')?.value || req.cookies.get('session')?.value || req.cookies.get('yosola-token')?.value;

  // 3. Verify Token
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const payload = await verifyJwt(token);
    
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};