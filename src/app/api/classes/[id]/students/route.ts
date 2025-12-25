// src/app/api/classes/[id]/students/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }, // 'id' here is the classId
) {
  try {
    const classId = params.id;

    // Find all enrollments for this class (for the current year?)
    // We might need to add an academicYear filter later.
    const enrollments = await prisma.enrollment.findMany({
      where: {
        classId: classId,
        // Optional: Filter by current academic year if needed
        // academicYear: getCurrentAcademicYear(),
      },
      include: {
        student: { // Get the student details
          select: {
            id: true,
            fullName: true,
            user: { select: { email: true } }, // Include email if needed
          },
        },
      },
      orderBy: {
        student: { fullName: 'asc' }, // Order by student name
      },
    });

    // Extract just the student data
    const students = enrollments.map(e => e.student);

    return NextResponse.json(students, { status: 200 });

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
       // Could fail if classId is invalid format, though unlikely with UUIDs
     }
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
