// src/app/api/exams/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for UPDATING an exam (all fields optional)
const updateExamSchema = z.object({
  name: z
    .string()
    .min(3, 'Exam name is required (e.g., "Term 1 Midterm")')
    .optional(),
  academicYear: z.string().min(4, 'Academic Year is required').optional(),
  startDate: z.string().date().optional().nullable(),
  endDate: z.string().date().optional().nullable(),
});

// --- GET A SINGLE EXAM (GET) ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const exam = await prisma.exam.findUniqueOrThrow({
      where: { id: params.id },
    });
    return NextResponse.json(exam, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

// --- UPDATE A SINGLE EXAM (PUT) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const data = updateExamSchema.parse(body);

    const updatedExam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...data,
        // Handle date conversion if it was sent
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return NextResponse.json(updatedExam, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}

// --- DELETE A SINGLE EXAM (DELETE) ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.exam.delete({
      where: { id: params.id },
    });

    // Return a 204 No Content response, standard for DELETE
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
