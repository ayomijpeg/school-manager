import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Removed unused addDays import

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
    const body: BulkInvoiceBody = await req.json();
    const { targetType, targetId, dueDate, items } = body;

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

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    
    // 2. Fix 'results' implicit any
    const count = await prisma.$transaction(async (tx) => {
        let processed = 0;
        for (const student of studentsToBill) {
            const year = new Date().getFullYear();
            const random = Math.floor(100000 + Math.random() * 900000);
            const invoiceNum = `INV-${year}-${random}`;

            const invoice = await tx.invoice.create({
                data: {
                    studentId: student.id,
                    invoiceNumber: invoiceNum,
                    issueDate: new Date(),
                    dueDate: new Date(dueDate),
                    totalAmount: totalAmount,
                    status: 'PENDING'
                }
            });

            await tx.invoiceItem.createMany({
                data: items.map((item) => ({
                    invoiceId: invoice.id,
                    description: item.description,
                    amount: Number(item.amount)
                }))
            });
            processed++;
        }
        return processed;
    }, { maxWait: 10000, timeout: 20000 });

    return NextResponse.json({ count });

  } catch (error) {
    console.error("Bulk Invoice Error:", error);
    return NextResponse.json({ error: "Failed to generate invoices" }, { status: 500 });
  }
}
