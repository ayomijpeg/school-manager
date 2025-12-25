// src/app/api/results/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for submitting a result
const resultSchema = z.object({
  studentId: z.string().uuid(),
  examId: z.string().uuid(),
  courseId: z.string().uuid(),
  marksObtained: z.number().min(0),
  maxMarks: z.number().min(1),
  grade: z.string().optional(), // e.g., "A+", "B"
  comments: z.string().optional(),
});

// --- CREATE OR UPDATE A RESULT (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = resultSchema.parse(body);

    // 2. Use 'upsert' to create a new result or update an existing one
    const result = await prisma.result.upsert({
      // 3. Define the unique composite key to find the record
      where: {
        studentId_examId_courseId: {
          studentId: data.studentId,
          examId: data.examId,
          courseId: data.courseId,
        },
      },
      // 4. Data to UPDATE if found
      update: {
        marksObtained: data.marksObtained,
        maxMarks: data.maxMarks,
        grade: data.grade,
        comments: data.comments,
      },
      // 5. Data to CREATE if not found
      create: {
        studentId: data.studentId,
        examId: data.examId,
        courseId: data.courseId,
        marksObtained: data.marksObtained,
        maxMarks: data.maxMarks,
        grade: data.grade,
        comments: data.comments,
      },
    });

    return NextResponse.json(result, { status: 200 }); // 200 OK, since it could be create or update
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
          { error: 'The specified Student, Exam, or Course does not exist.' },
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
