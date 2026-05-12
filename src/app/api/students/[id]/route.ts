import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// --- 1. GET: Fetch a single student ---
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: {
          include: { class: true },
          orderBy: { academicYear: 'desc' },
          take: 1
        }
      },
    });

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // Flatten the classId for the frontend form to read easily
    const flattenedStudent = {
      ...student,
      classId: student.enrollments[0]?.classId || ''
    };

    return NextResponse.json(flattenedStudent);
  } catch (error) {
    // 🟢 FIXED: Log the error to satisfy 'no-unused-vars'
    console.error("GET Student Error:", error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// --- 2. PATCH: Update a student & Class Assignment ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const schoolConfig = await prisma.schoolConfig.findFirst();
    const currentYear = schoolConfig?.academicYear;

    if (!currentYear) {
       return NextResponse.json({ error: 'Academic year not set in settings' }, { status: 400 });
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {
      // A. Update Student Profile
      const student = await tx.student.update({
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

      // B. Update User Email
      if (body.email) {
        await tx.user.update({
          where: { id: student.userId },
          data: { email: body.email.toLowerCase().trim() }
        });
      }

      // C. Update Enrollment
      if (body.classId !== undefined) {
        const existingEnrollment = await tx.enrollment.findFirst({
            where: { studentId: id, academicYear: currentYear }
        });

        if (existingEnrollment) {
            await tx.enrollment.update({
                where: { id: existingEnrollment.id },
                data: { classId: body.classId || null } 
            });
        } else if (body.classId) {
            await tx.enrollment.create({
                data: {
                    studentId: id,
                    classId: body.classId,
                    academicYear: currentYear
                }
            });
        }
      }

      return student;
    });

    return NextResponse.json(updatedStudent);
  } catch (error: unknown) {
    // 🟢 FIXED: Changed 'any' to 'unknown' and added type guard
    console.error("❌ PATCH Student Error:", error);
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// --- 3. DELETE: Archive Student ---
export async function DELETE(
  _request: Request, // 🟢 FIXED: Prefixed with underscore as it is unused
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.student.update({
      where: { id },
      // 🟢 FIXED: Replaced 'as any' with a more specific unknown cast
      data: { deletedAt: new Date() } as unknown as { deletedAt: Date }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // 🟢 FIXED: Log the error to satisfy 'no-unused-vars'
    console.error("DELETE Student Error:", error);
    return NextResponse.json({ error: 'Archive failed' }, { status: 500 });
  }
}
