import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for a single row in the bulk upload
const bulkResultItemSchema = z.object({
  studentId: z.string().uuid(),
  caScore: z.number().min(0).max(40).optional(),   // Adjust max as per school policy
  examScore: z.number().min(0).max(60).optional(),
});

const bulkUploadSchema = z.object({
  examId: z.string().uuid(),
  courseId: z.string().uuid(),
  results: z.array(bulkResultItemSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, courseId, results } = bulkUploadSchema.parse(body);

    // We use a Transaction to ensure all scores save, or none do.
    const operations = results.map((entry) => {
      const ca = entry.caScore || 0;
      const exam = entry.examScore || 0;
      const total = ca + exam;

      // Auto-calculate Grade (Move this logic to a shared helper utility later)
      let grade = 'F';
      if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B';
      else if (total >= 50) grade = 'C';
      else if (total >= 45) grade = 'D';
      
      return prisma.result.upsert({
        where: {
          studentId_examId_courseId: {
            studentId: entry.studentId,
            examId: examId,
            courseId: courseId,
          },
        },
        update: {
          caScore: ca,
          examScore: exam,
          totalScore: total,
          grade: grade,
        },
        create: {
          studentId: entry.studentId,
          examId: examId,
          courseId: courseId,
          caScore: ca,
          examScore: exam,
          totalScore: total,
          grade: grade,
        },
      });
    });

    // Execute all upserts in parallel within a transaction
    await prisma.$transaction(operations);

    return NextResponse.json({ message: `Successfully processed ${results.length} results.` });

  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return NextResponse.json({ error: 'Bulk processing failed.' }, { status: 500 });
  }
}
