import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // FIXED: Named import

// Helper for Params
type Props = { params: Promise<{ id: string }> };

// --- GET SINGLE TEACHER ---
export async function GET(request: Request, props: Props) {
  try {
    const { id } = await props.params;
    
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    });
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// --- PATCH: UPDATE TEACHER ---
export async function PATCH(request: Request, props: Props) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        fullName: body.fullName,
        contactPhone: body.contactPhone,
        departmentId: body.departmentId || null,
      }
    });

    // Update Email if provided
    if (body.email && teacher.userId) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { email: body.email }
      });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// --- DELETE: ARCHIVE TEACHER ---
export async function DELETE(request: Request, props: Props) {
  try {
    const { id } = await props.params;
    
    await prisma.teacher.update({
        where: { id },
        data: { 
            deletedAt: new Date(),
            user: {
                update: { deletedAt: new Date() } // Also block login
            }
        } 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
