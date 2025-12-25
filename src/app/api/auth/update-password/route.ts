import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt'; 
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth'; 

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;

    // --- DEBUGGING LOGS ---
    console.log("1. Cookie Token:", token ? "Found" : "Missing");
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token found' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    console.log("2. JWT Verification Result:", payload); // See if this is null

    if (!payload || !payload.sub) {
       return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }
    // ----------------------

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
      data: { passwordHash: newHashedPassword },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Security Update Error:", error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
