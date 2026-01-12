import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Updated Schema to match your Database Columns
const resultSchema = z.object({
  studentId: z.string().uuid(),
  examId: z.string().uuid(),
  courseId: z.string().uuid(),
  // Frontend sends these scores
  caScore: z.number().min(0).default(0),
  examScore: z.number().min(0).default(0),
  // Calculated fields
  totalScore: z.number().default(0),
  grade: z.string().optional(),
  comments: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = resultSchema.parse(body);

    const result = await prisma.result.upsert({
      where: {
        // Unique Constraint from your Schema
        studentId_examId_courseId: {
          studentId: data.studentId,
          examId: data.examId,
          courseId: data.courseId,
        },
      },
      update: {
        caScore: data.caScore,
        examScore: data.examScore,
        totalScore: data.totalScore, // Saved to DB
        grade: data.grade,
        remark: data.comments, // Schema calls it 'remark', frontend sent 'comments'
      },
      create: {
        studentId: data.studentId,
        examId: data.examId,
        courseId: data.courseId,
        caScore: data.caScore,
        examScore: data.examScore,
        totalScore: data.totalScore,
        grade: data.grade,
        remark: data.comments,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    
    // Check for Prisma "Record Not Found" errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
         return NextResponse.json({ error: 'Student, Exam, or Course ID not found.' }, { status: 404 });
      }
    }
    
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
