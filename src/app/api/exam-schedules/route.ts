// src/app/api/exam-schedules/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for creating an exam schedule
const examScheduleSchema = z.object({
  examId: z.string().uuid(),
  classId: z.string().uuid(),
  courseId: z.string().uuid(),
  examDate: z.string().datetime(), // Expects ISO 8601 string (e.g., "2025-11-10T09:00:00Z")
  durationMinutes: z.number().int().positive(),
  room: z.string().optional(),
});

// --- CREATE A NEW EXAM SCHEDULE (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = examScheduleSchema.parse(body);

    const newSchedule = await prisma.examSchedule.create({
      data: {
        examId: data.examId,
        classId: data.classId,
        courseId: data.courseId,
        examDate: new Date(data.examDate), // Convert string to Date
        durationMinutes: data.durationMinutes,
        room: data.room,
      },
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // "Foreign key constraint failed"
      if (error.code === 'P2003') {
         return NextResponse.json(
          { error: 'The specified Exam, Class, or Course does not exist.' },
          { status: 404 },
        );
      }
      // Consider adding unique constraints if needed (e.g., one exam per course per class)
    }
    
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

// --- GET EXAM SCHEDULES (GET) ---
// Optional: Filter by examId or classId via query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const classId = searchParams.get('classId');

    const whereClause: Prisma.ExamScheduleWhereInput = {};
    if (examId) whereClause.examId = examId;
    if (classId) whereClause.classId = classId;

    const schedules = await prisma.examSchedule.findMany({
      where: whereClause,
      orderBy: [
        { examDate: 'asc' }, // Sort primarily by date
        { class: { level: { name: 'asc' } } }, // Then by level
        { class: { name: 'asc' } }, // Then by class name
        { course: { name: 'asc' } }, // Then by course name
      ],
      include: {
        exam: { select: { name: true, academicYear: true } },
        class: { select: { name: true, level: { select: { name: true } } } },
        course: { select: { name: true } },
      },
    });

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
