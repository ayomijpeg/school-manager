import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// --- 1. GET: Fetch a single student (Used by Edit Modal) ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15: params is a Promise
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true, // Need this to get the email
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("GET Student Error:", error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// --- 2. PATCH: Update a student (Used by Edit Form) ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update Student Profile
    const student = await prisma.student.update({
      where: { id },
      data: {
        fullName: body.fullName,
        contactPhone: body.contactPhone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        levelId: body.levelId,
        departmentId: body.departmentId || null,
        gender: body.gender
      }
    });

    // Update User Email if provided
    if (body.email) {
      // Check if email is taken by another user? (Skipping for MVP speed, but good to add later)
      await prisma.user.update({
        where: { id: student.userId },
        data: { email: body.email }
      });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("PATCH Student Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// --- 3. DELETE: Soft Delete (Archive) ---
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft Delete: Just set the date
    await prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Student Error:", error);
    return NextResponse.json({ error: 'Archive failed' }, { status: 500 });
  }
}
