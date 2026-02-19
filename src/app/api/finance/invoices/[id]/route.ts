import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/session';
import { Prisma } from '@prisma/client';

type Props = { params: Promise<{ id: string }> };

// DELETE INVOICE
export async function DELETE(req: Request, props: Props) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await props.params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// RECORD PAYMENT (PATCH)
export async function PATCH(req: Request, props: Props) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await props.params;
    const body = await req.json();
    const { amount, method, date } = body;

    const paymentAmount = Number(amount);
    if (Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }
    const paymentDate = date ? new Date(date) : new Date();
    if (Number.isNaN(paymentDate.getTime())) {
      return NextResponse.json({ error: 'Invalid payment date' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findUnique({ where: { id } });
        
        if (!invoice) throw new Error("Invoice not found");
        
        const payment = await tx.payment.create({
            data: {
                invoiceId: id,
                amountPaid: paymentAmount,
                paymentDate: paymentDate,
                paymentMethod: method ?? undefined,
            }
        });

        const newPaidTotal = Number(invoice.amountPaid) + paymentAmount;
        const total = Number(invoice.totalAmount);
        
        // Explicitly type the status
        let newStatus: InvoiceStatus = 'PARTIALLY_PAID';
        if (newPaidTotal >= total) newStatus = 'PAID';
        if (newPaidTotal <= 0) newStatus = 'PENDING';

        await tx.invoice.update({
            where: { id },
            data: {
                amountPaid: newPaidTotal,
                status: newStatus
            }
        });

        return payment;
    }, {
        maxWait: 20000, 
        timeout: 30000
    });

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("Payment Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
