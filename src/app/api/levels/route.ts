// src/app/api/levels/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 1. Zod schema for creating a grade
const gradeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

// --- CREATE A NEW GRADE (POST) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = gradeSchema.parse(body);

    const newGrade = await prisma.level.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(newGrade, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalieed input', details: error.issues },
        { status: 400 },
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // "Unique constraint failed"
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A grade with this name already exists.' },
          { status: 409 },
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

// --- GET ALL GRADES (GET) ---
export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { name: 'asc' }, // Sorts JSS1, JSS2, etc.
    });

    return NextResponse.json(levels);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
  }
}
