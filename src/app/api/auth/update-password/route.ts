import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt'; 
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth'; 

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token found' }, { status: 401 });
    }

    const payload = await verifyJwt(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ 
        where: { id: payload.sub as string } 
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify Old Password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Update Password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHashedPassword, passwordResetRequired: false },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update password error:', error);
    }
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
