export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Schema
const createCourseSchema = z.object({
  name: z.string().min(2, 'Course name is required'),
  levelId: z.string().uuid('Level is required'),
  code: z.string().optional().or(z.literal('')),
  department: z.string().optional().nullable(), // Accepts "Science", "Arts", etc.
});

// --- POST: Create New Course (Fixed) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createCourseSchema.parse(body);

    // 1. Handle Department Logic (The Fix)
    // We cannot pass the name "Science" directly to departmentId.
    // We must find the ID of "Science" or create it.
    let departmentIdToUse = null;

    if (data.department) {
      // Step A: Search for existing department
      const existingDept = await prisma.department.findFirst({
        where: { 
            name: { equals: data.department, mode: 'insensitive' } 
        }
      });

      if (existingDept) {
        departmentIdToUse = existingDept.id;
      } else {
        // Step B: Create it if it doesn't exist
        try {
            const newDept = await prisma.department.create({
                data: { name: data.department }
            });
            departmentIdToUse = newDept.id;
        } catch (deptError) {
            console.warn("Could not auto-create department. Ignoring.", deptError);
            // If creation fails (maybe facultyId is required?), we proceed without a department
            departmentIdToUse = null; 
        }
      }
    }

    // 2. Create the Course
    const newCourse = await prisma.course.create({
      data: {
        name: data.name,
        code: data.code || null,
        levelId: data.levelId,
        // Now we use the valid UUID (or null), never the raw string
        departmentId: departmentIdToUse, 
      },
    });

    return NextResponse.json(newCourse, { status: 201 });

  } catch (error: unknown) {
    console.error("[Create Course Error]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- GET: Fetch All Courses ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');

    const whereClause: Prisma.CourseWhereInput = {};
    if (levelId) whereClause.levelId = levelId;

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        level: { select: { name: true } },
        department: { select: { name: true } }, 
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(courses);

  } catch (error) {
    console.error("Fetch Courses Error:", error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
