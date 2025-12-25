// src/app/api/exams/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// 1. Zod schema for creating an exam
const examSchema = z.object({
  name: z.string().min(3, 'Exam name is required (e.g., "Term 1 Midterm")'),
  academicYear: z.string().min(4, 'Academic Year is required'),
  startDate: z.string().date().optional(), // Expects "YYYY-MM-DD"
  endDate: z.string().date().optional(),
});

// --- CREATE A NEW EXAM (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = examSchema.parse(body);

    const newExam = await prisma.exam.create({
      data: {
        name: data.name,
        academicYear: data.academicYear,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

// --- GET ALL EXAMS (GET) ---
export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: [
        {
          academicYear: 'desc', // Show newest year first
        },
        {
          name: 'asc',
        },
      ],
    });

    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
