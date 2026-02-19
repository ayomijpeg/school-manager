import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { jwtVerify } from 'jose';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: rateLimit.retryAfter ? { 'Retry-After': String(rateLimit.retryAfter) } : undefined }
    );
  }

  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (!token) {
      return NextResponse.json({ error: 'Reset link is invalid or missing' }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    if (!secret.length) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { payload } = await jwtVerify(token, secret).catch(() => ({ payload: null }));
    if (!payload || (payload as { type?: string }).type !== 'password_reset') {
      return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
    }

    const userId = (payload as { userId?: string }).userId;
    if (!userId) {
      return NextResponse.json({ error: 'Reset link is invalid' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetRequired: false },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Reset password error:', e);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
