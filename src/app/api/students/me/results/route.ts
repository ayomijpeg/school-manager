// src/app/api/students/me/results/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// --- GET MY OWN RESULTS (GET) ---
export async function GET(request: NextRequest) {
  try {
    // 1. Get user ID from their token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const userId = (payload as { userId: string }).userId;
    const userRole = (payload as { role: string }).role;

    // 2. Find the studentId linked to this user
    // (We'll add parent logic here later)
    if (userRole !== 'STUDENT' && userRole !== 'ADMIN') {
      // Simple check for now. A PARENT would have a different flow.
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const student = await prisma.student.findFirst({
      where: { userId: userId },
      select: { id: true },
    });
    
    if (!student) {
      return NextResponse.json({ error: 'No student profile found for this user.' }, { status: 404 });
    }

    // 3. Find all results for THIS student
    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          select: { name: true }, // Show "Mathematics"
        },
        exam: {
          select: { name: true, academicYear: true }, // Show "Term 1 Final (2024-2025)"
        },
      },
      orderBy: [
        { exam: { academicYear: 'desc' } },
        { exam: { name: 'asc' } },
        { course: { name: 'asc' } },
      ],
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
