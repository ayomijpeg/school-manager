import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for UPDATING (with Empty String Safety)
const updateExamSchema = z.object({
  name: z.string().min(3).optional(),
  academicYear: z.string().min(4).optional(),
  
  // FIX: Handle "" from forms by converting to undefined
  startDate: z.preprocess(
    (arg) => (arg === '' ? undefined : arg), 
    z.string().date().optional().nullable()
  ),
  
  endDate: z.preprocess(
    (arg) => (arg === '' ? undefined : arg), 
    z.string().date().optional().nullable()
  ),
});

// --- GET A SINGLE EXAM ---
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+ types if needed
) {
  try {
    const { id } = await params; // Await params in newer Next.js versions
    const exam = await prisma.exam.findUniqueOrThrow({
      where: { id },
    });
    return NextResponse.json(exam, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- UPDATE A SINGLE EXAM ---
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateExamSchema.parse(body);

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        name: data.name,
        academicYear: data.academicYear,
        // Safe conversion: only convert if data exists
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    return NextResponse.json(updatedExam, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    console.error("Update Exam Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE A SINGLE EXAM ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.exam.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
