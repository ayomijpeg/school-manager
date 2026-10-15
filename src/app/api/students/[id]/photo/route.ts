import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { photoUrl } = body;

    if (!photoUrl || typeof photoUrl !== 'string') {
      return NextResponse.json({ error: 'Valid photoUrl is required' }, { status: 400 });
    }

    // Update the student record
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { photoUrl },
      select: { id: true, fullName: true, photoUrl: true },
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Photo update error:', error);
    return NextResponse.json(
      { error: 'Failed to update student photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { photoUrl: null },
      select: { id: true, fullName: true, photoUrl: true },
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Photo remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove student photo' },
      { status: 500 }
    );
  }
}
