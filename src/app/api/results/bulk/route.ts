import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for a single row in the bulk upload
const bulkResultItemSchema = z.object({
  studentId: z.string().uuid(),
  caScore: z.number().min(0).max(40).optional(),   
  examScore: z.number().min(0).max(60).optional(),
});

// FIXED: Added courseId to the schema
const bulkUploadSchema = z.object({
  examId: z.string().uuid(),
  courseId: z.string().uuid(), // <--- WAS MISSING
  results: z.array(bulkResultItemSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate body (this will now check for courseId too)
    const { examId, courseId, results } = bulkUploadSchema.parse(body);

    // We use a Transaction to ensure all scores save, or none do.
    const operations = results.map((entry) => {
      const ca = entry.caScore || 0;
      const exam = entry.examScore || 0;
      const total = ca + exam;

      // Auto-calculate Grade
      let grade = 'F';
      if (total >= 70) grade = 'A';
      else if (total >= 60) grade = 'B';
      else if (total >= 50) grade = 'C';
      else if (total >= 45) grade = 'D';
      else if (total >= 40) grade = 'E'; // Standard WAEC/NECO often uses E for 40-45

      return prisma.result.upsert({
        where: {
          // This must match the @unique constraint in your schema.prisma
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
    
    // Return specific Zod validation errors to help frontend debugging
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Bulk processing failed.' }, { status: 500 });
  }
}
