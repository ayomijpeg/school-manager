import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

interface InvoiceItemInput {
  description: string;
  amount: string | number;
}

interface BulkInvoiceBody {
  targetType: 'ALL' | 'CLASS';
  targetId?: string;
  dueDate: string;
  items: InvoiceItemInput[];
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body: BulkInvoiceBody = await req.json();
    const { targetType, targetId, dueDate, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }
    const validItems = items.filter(
      (i) => typeof i.description === 'string' && i.description.trim() !== '' && Number(i.amount) > 0
    );
    if (validItems.length === 0) {
      return NextResponse.json({ error: 'Each item must have a description and a positive amount' }, { status: 400 });
    }
    const totalAmount = validItems.reduce((sum, item) => sum + Number(item.amount), 0);
    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Total amount must be greater than 0' }, { status: 400 });
    }

    // 1. Explicitly type the array to avoid 'any[]' error
    let studentsToBill: { id: string }[] = [];
    
    if (targetType === 'ALL') {
      studentsToBill = await prisma.student.findMany({ 
        where: { deletedAt: null },
        select: { id: true } 
      });
    } else if (targetType === 'CLASS' && targetId) {
      studentsToBill = await prisma.student.findMany({
        where: { levelId: targetId, deletedAt: null },
        select: { id: true }
      });
    }

    if (studentsToBill.length === 0) {
      return NextResponse.json({ error: "No students found for this selection" }, { status: 400 });
    }

    const dueDateObj = new Date(dueDate);
    // Normalize to start of day for consistent comparison
    dueDateObj.setHours(0, 0, 0, 0);

    // Skip students who already have an invoice with the same due date (prevents duplicate runs)
    const existingForDueDate = await prisma.invoice.findMany({
      where: {
        studentId: { in: studentsToBill.map((s) => s.id) },
        dueDate: { gte: dueDateObj, lt: new Date(dueDateObj.getTime() + 24 * 60 * 60 * 1000) },
      },
      select: { studentId: true },
    });
    const existingStudentIds = new Set(existingForDueDate.map((i) => i.studentId));
    const studentsToProcess = studentsToBill.filter((s) => !existingStudentIds.has(s.id));
    const skipped = studentsToBill.length - studentsToProcess.length;

    if (studentsToProcess.length === 0) {
      return NextResponse.json(
        { error: "All selected students already have an invoice for this due date. No new invoices created.", count: 0, skipped },
        { status: 400 }
      );
    }

    const count = await prisma.$transaction(async (tx) => {
        let processed = 0;
        for (const student of studentsToProcess) {
            const year = new Date().getFullYear();
            const random = Math.floor(100000 + Math.random() * 900000);
            const invoiceNum = `INV-${year}-${random}`;

            const invoice = await tx.invoice.create({
                data: {
                    studentId: student.id,
                    invoiceNumber: invoiceNum,
                    issueDate: new Date(),
                    dueDate: dueDateObj,
                    totalAmount: totalAmount,
                    status: 'PENDING'
                }
            });

            await tx.invoiceItem.createMany({
                data: validItems.map((item) => ({
                    invoiceId: invoice.id,
                    description: item.description,
                    amount: Number(item.amount)
                }))
            });
            processed++;
        }
        return processed;
    }, { maxWait: 10000, timeout: 20000 });

    return NextResponse.json({ count, skipped });

  } catch (error) {
    console.error("Bulk Invoice Error:", error);
    return NextResponse.json({ error: "Failed to generate invoices" }, { status: 500 });
  }
}
