import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for creating a class
const classSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  levelId: z.string().uuid('Invalid Level ID'),
  // Optional roomNumber
  roomNumber: z.string().nullable().optional(),
  // Optional foreign key to Department
  departmentId: z.string().uuid('Invalid Department ID').nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = classSchema.parse(body);

    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        levelId: data.levelId,
        departmentId: data.departmentId ?? null,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }

    const anyError = error as { code?: string; message?: string };

    if (anyError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A class with this name already exists in this level.' },
        { status: 409 },
      );
    }

    console.error('[POST /api/classes] error', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: anyError.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: [
        { level: { name: 'asc' } },
        { name: 'asc' },
      ],
      include: {
        level: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('[GET /api/classes] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 },
    );
  }
}
