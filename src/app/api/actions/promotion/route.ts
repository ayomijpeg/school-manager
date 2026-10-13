import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, newLevelId, newClassId, newAcademicYear } = body;

    if (!studentId || !newLevelId || !newClassId || !newAcademicYear) {
      return NextResponse.json(
        { error: 'Student ID, target Level, Class, and Academic Year are all required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current student and their latest enrollment
      const currentStudent = await tx.student.findUnique({
        where: { id: studentId },
        select: { levelId: true, fullName: true },
      });

      if (!currentStudent) {
        throw new Error('Student not found');
      }

      const latestEnrollment = await tx.enrollment.findFirst({
        where: { studentId },
        orderBy: { academicYear: 'desc' },
        select: { classId: true, academicYear: true },
      });

      // 2. Update Student: set new level and ensure status is ACTIVE
      await tx.student.update({
        where: { id: studentId },
        data: {
          levelId: newLevelId,
          status: 'ACTIVE',
        },
      });

      // 3. Upsert Enrollment for the target academic year
      // Check if student already has an enrollment in this academic session
      const existingEnrollmentInTargetYear = await tx.enrollment.findFirst({
        where: {
          studentId,
          academicYear: newAcademicYear,
        },
      });

      if (existingEnrollmentInTargetYear) {
        // Update to the new class in that year (prevents duplicate class assignments in same session)
        await tx.enrollment.update({
          where: { id: existingEnrollmentInTargetYear.id },
          data: {
            classId: newClassId,
          },
        });
      } else {
        // Create new enrollment for the new session
        await tx.enrollment.create({
          data: {
            studentId,
            classId: newClassId,
            academicYear: newAcademicYear,
          },
        });
      }

      // 4. Record in Promotion History
      await tx.promotionHistory.create({
        data: {
          studentId,
          fromLevelId: currentStudent.levelId || null,
          toLevelId: newLevelId,
          fromClassId: latestEnrollment?.classId || null,
          toClassId: newClassId,
          academicYear: newAcademicYear,
        },
      });

      return { name: currentStudent.fullName };
    });

    return NextResponse.json({ success: true, name: result.name });

  } catch (error: unknown) {
    console.error("Promotion API Error:", error);
    let errorMessage = "An unexpected error occurred";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        errorMessage = "Student is already enrolled in this class for the selected session";
      } else {
        errorMessage = `Database Error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
