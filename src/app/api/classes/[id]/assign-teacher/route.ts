// src/app/api/classes/[id]/assign-teacher/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for assignment
const assignTeacherSchema = z.object({
  teacherId: z.string().uuid('Invalid Teacher ID'),
  courseId: z.string().uuid('Invalid Course ID'),
});

// --- ASSIGN A TEACHER TO A COURSE IN A CLASS (POST) ---
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }, // 'id' here is the classId
) {
  try {
    const classId = params.id;
    const body = await request.json();
    const { teacherId, courseId } = assignTeacherSchema.parse(body);

    // 2. Create the ClassAssignment record
    const newAssignment = await prisma.classAssignment.create({
      data: {
        teacherId: teacherId,
        courseId: courseId,
        classId: classId,
      },
      include: {
        // Return names for confirmation
        teacher: { select: { fullName: true } },
        course: { select: { name: true } },
        class: { select: { name: true, level: { select: { name: true } } } },
      },
    });

    // 3. Send back a descriptive success message
    // e.g., "Assigned Mr. Adebayo to teach Physics in JSS 1A"
    return NextResponse.json(
      {
        message: `Assigned ${newAssignment.teacher.fullName} to teach ${newAssignment.course.name} in ${newAssignment.class.level.name} ${newAssignment.class.name}`,
        data: newAssignment,
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
      // This catches if this teacher is already assigned this course in this class
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'This teacher is already assigned this course in this class.' },
          { status: 409 },
        );
      }
      // "Foreign key constraint failed"
      // This catches if the teacherId, courseId, or classId is wrong
      if (error.code === 'P2003') {
         return NextResponse.json(
          { error: 'The specified Teacher, Course, or Class does not exist.' },
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
