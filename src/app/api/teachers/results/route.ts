import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 1. Define an interface for the incoming result data
interface ResultInput {
  studentId: string;
  caScore: string | number;
  examScore: string | number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Type the destructured variables
    const { courseId, results }: { courseId: string; results: ResultInput[] } = body;

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const config = await prisma.schoolConfig.findFirst();
    if (!config) {
      return NextResponse.json({ error: "School configuration not found" }, { status: 400 });
    }

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

    // Process and Save results using a Transaction
    await prisma.$transaction(
      results.map((res: ResultInput) => { // 🟢 Fixed: Replaced 'any' with ResultInput
        const ca = typeof res.caScore === 'string' ? parseFloat(res.caScore) : res.caScore;
        const ex = typeof res.examScore === 'string' ? parseFloat(res.examScore) : res.examScore;
        
        const caScore = ca || 0;
        const examScore = ex || 0;
        const total = caScore + examScore;

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
            caScore: caScore,
            examScore: examScore,
            totalScore: total,
            grade: grade,
          },
          create: {
            studentId: res.studentId,
            examId: exam!.id,
            courseId: courseId,
            caScore: caScore,
            examScore: examScore,
            totalScore: total,
            grade: grade,
          }
        });
      })
    );

    return NextResponse.json({ success: true, message: "Results saved!" });

  } catch (error: unknown) { // 🟢 Fixed: Replaced 'any' with 'unknown'
    console.error("RESULT_SAVE_ERROR:", error);
    
    // Safely extract the error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage }, 
      { status: 500 }
    );
  }
}
