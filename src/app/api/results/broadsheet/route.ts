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

    // Assign class rank / position (e.g. 1st out of 30)
    const withPosition = processed.map((s, idx) => {
      const pos = idx + 1;
      const suffix = (n: number) => {
        if (n % 10 === 1 && n % 100 !== 11) return 'st';
        if (n % 10 === 2 && n % 100 !== 12) return 'nd';
        if (n % 10 === 3 && n % 100 !== 13) return 'rd';
        return 'th';
      };
      return {
        ...s,
        summary: {
          ...s.summary,
          position: pos,
          positionText: `${pos}${suffix(pos)} out of ${processed.length}`,
        }
      };
    });

    return NextResponse.json(withPosition);
  } catch (error) {
    console.error("Broadsheet Error:", error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
