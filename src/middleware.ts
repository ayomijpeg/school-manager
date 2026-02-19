import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth'; 

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/new-password',
  '/setup',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/setup',
  '/api/health',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Redirect old or wrong dashboard paths so they don't 404
  if (pathname === '/dashboard/teacher' || pathname.startsWith('/dashboard/teacher/')) {
    const rest = pathname === '/dashboard/teacher' ? '' : pathname.slice('/dashboard/teacher'.length);
    return NextResponse.redirect(new URL(`/dashboard/teachers${rest}`, req.url));
  }
  if (pathname === '/dashboard/attendance') {
    return NextResponse.redirect(new URL('/dashboard/teachers/attendance', req.url));
  }
  if (pathname === '/dashboard/finance/invoice') {
    return NextResponse.redirect(new URL('/dashboard/finance', req.url));
  }
  if (pathname === '/settings' && !pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard/settings', req.url));
  }
  if (pathname === '/dashboard/admin/teachers') {
    return NextResponse.redirect(new URL('/dashboard/teachers', req.url));
  }

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