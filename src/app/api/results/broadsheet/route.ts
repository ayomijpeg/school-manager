export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const levelId = searchParams.get('levelId');
  const examId = searchParams.get('examId');

  if (!levelId || !examId) {
    return NextResponse.json({ error: 'Missing levelId or examId' }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: { 
        levelId: levelId, 
        deletedAt: null 
      },
      include: {
        results: {
          where: { examId: examId },
          include: { course: true } // Include subject names
        },
        level: true
      },
      orderBy: { fullName: 'asc' }
    });

    // Calculate Averages and Positions (Basic Logic)
    const processed = students.map(s => {
      const totalScore = s.results.reduce((acc, curr) => acc + Number(curr.totalScore), 0);
      const average = s.results.length > 0 ? totalScore / s.results.length : 0;
      
      return {
        ...s,
        summary: {
          totalScore,
          average: average.toFixed(2),
          subjectCount: s.results.length
        }
      };
    });

    // Sort by Total Score to determine class position
    processed.sort((a, b) => b.summary.totalScore - a.summary.totalScore);

    return NextResponse.json(processed);
  } catch (error) {
    console.error("Broadsheet Error:", error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
