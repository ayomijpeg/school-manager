import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { checkRateLimit } from '@/lib/rateLimit';

const RESET_EXPIRY = '1h'; // 1 hour

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimit.retryAfter ? { 'Retry-After': String(rateLimit.retryAfter) } : undefined }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    if (!secret.length) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const token = await new SignJWT({ type: 'password_reset', userId: user.id, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(RESET_EXPIRY)
      .setIssuedAt()
      .sign(secret);

    const origin = request.headers.get('origin') || request.headers.get('referer');
    const baseUrl = origin ? new URL(origin).origin : (process.env.NEXTAUTH_URL || '');
    const resetLink = baseUrl ? `${baseUrl.replace(/\/$/, '')}/auth/reset-password?token=${encodeURIComponent(token)}` : undefined;

    return NextResponse.json({ success: true, resetLink });
  } catch (e) {
    console.error('Forgot password error:', e);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
