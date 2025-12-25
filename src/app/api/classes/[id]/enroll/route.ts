// src/app/api/classes/[id]/enroll/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for enrollment
const enrollSchema = z.object({
  studentId: z.string().uuid('Invalid Student ID'),
  academicYear: z
    .string()
    .min(4, 'Academic Year is required (e.g., "2024-2025")'),
});

// --- ENROLL A STUDENT IN A CLASS (POST) ---
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }, // 'id' here is the classId
) {
  try {
    const classId = params.id;
    const body = await request.json();
    const { studentId, academicYear } = enrollSchema.parse(body);

    // 2. Create the enrollment record
    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId: studentId,
        classId: classId,
        academicYear: academicYear,
      },
      include: {
        // Return the student and class names for confirmation
        student: { select: { fullName: true } },
        class: { select: { name: true, level: { select: { name: true } } } },
      },
    });

    // 3. Send back a descriptive success message
    // e.g., "Enrolled John Doe in JSS 1A"
    return NextResponse.json(
      {
        message: `Enrolled ${newEnrollment.student.fullName} in ${newEnrollment.class.level.name} ${newEnrollment.class.name}`,
        data: newEnrollment,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // "Unique constraint failed"
      // This catches if the student is already enrolled in this class
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'This student is already enrolled in this class for this academic year.' },
          { status: 409 },
        );
      }
      // "Foreign key constraint failed"
      // This catches if the studentId or classId provided doesn't exist
      if (error.code === 'P2003') {
         return NextResponse.json(
          { error: 'The specified Student or Class does not exist.' },
          { status: 404 },
        );
      }
    }
    
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
