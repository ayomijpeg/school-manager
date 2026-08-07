import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { StudentStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 🟢 Changed: params is now a Promise
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🟢 FIXED: Await the params in Next.js 15
    const { id } = await params; 
    
    const body = await request.json();
    const { status } = body;

    // Validate that the status sent is part of our Enum
    if (!Object.values(StudentStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid Status' }, { status: 400 });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { status: status as StudentStatus },
      select: { fullName: true, status: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: `${updatedStudent.fullName} is now marked as ${updatedStudent.status}` 
    });

  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
