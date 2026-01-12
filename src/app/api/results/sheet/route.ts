export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get('levelId');
  const courseId = searchParams.get('courseId');
  const examId = searchParams.get('examId');

  if (!levelId || !courseId || !examId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: { 
        levelId: levelId,
        deletedAt: null
      },
      select: {
        id: true,
        fullName: true,
        matricNumber: true,
        // 🟢 FIX: Removed invalid 'where' clause. Added sorting to get the latest class.
        enrollments: {
            take: 1,
            orderBy: { academicYear: 'desc' }, // Get the most recent enrollment
            select: { 
                class: { 
                    select: { name: true } 
                } 
            }
        },
        results: {
            where: {
                examId: examId,
                courseId: courseId
            },
            select: {
                caScore: true,
                examScore: true,
                totalScore: true
            }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Sheet Load Error:", error);
    return NextResponse.json({ error: 'Failed to fetch sheet' }, { status: 500 });
  }
}
