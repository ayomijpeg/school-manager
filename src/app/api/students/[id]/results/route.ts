// src/app/api/students/[id]/results/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';


// --- GET ALL RESULTS FOR A SINGLE STUDENT (GET) ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }, // 'id' here is the Student ID
) {
  try {
    // 1. Get the studentId from the URL
    const studentId = params.id;

    // 2. Find all results for this student
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
      },
      // 3. Include the names of the course and exam for a full report
      include: {
        course: {
          select: {
            name: true,
          },
        },
        exam: {
          select: {
            name: true,
            academicYear: true,
          },
        },
      },
      orderBy: [
        { exam: { academicYear: 'desc' } }, // Order by year
        { exam: { name: 'asc' } },           // Then by exam name
        { course: { name: 'asc' } },         // Then by course name
      ],
    });

    if (results.length === 0) {
      // It's not an error if they have no results, just return an empty array
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    // This will catch errors like an invalid studentId format
    // or other database issues.
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
