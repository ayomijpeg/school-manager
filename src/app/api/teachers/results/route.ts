import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, results } = body; // matches frontend payload

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // 1. Get current settings from SchoolConfig
    const config = await prisma.schoolConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: "School configuration not found" }, { status: 400 });
    }

    // 2. Find or Create an Exam record for this Term/Year
    let exam = await prisma.exam.findFirst({
      where: {
        name: config.currentTerm,
        academicYear: config.academicYear
      }
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          name: config.currentTerm,
          academicYear: config.academicYear
        }
      });
    }

    // 3. Process and Save results using a Transaction
    await prisma.$transaction(
      results.map((res: any) => {
        const ca = parseFloat(res.caScore) || 0;
        const examScore = parseFloat(res.examScore) || 0;
        const total = ca + examScore;

        // Grading Logic
        let grade = 'F';
        if (total >= 70) grade = 'A';
        else if (total >= 60) grade = 'B';
        else if (total >= 50) grade = 'C';
        else if (total >= 45) grade = 'D';
        else if (total >= 40) grade = 'E';

        return prisma.result.upsert({
          where: {
            studentId_examId_courseId: {
              studentId: res.studentId,
              examId: exam!.id,
              courseId: courseId
            }
          },
          update: {
            caScore: ca,
            examScore: examScore,
            totalScore: total,
            grade: grade,
          },
          create: {
            studentId: res.studentId,
            examId: exam!.id,
            courseId: courseId,
            caScore: ca,
            examScore: examScore,
            totalScore: total,
            grade: grade,
          }
        });
      })
    );

    return NextResponse.json({ success: true, message: "Results saved!" });

  } catch (error: any) {
    console.error("RESULT_SAVE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}
