import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: Request) {
  try {
    // 1. Security Check
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { paymentId, action } = await request.json(); // action = 'APPROVE' or 'REJECT'

    // 2. Database Transaction (Safety First)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Get the Payment details
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { invoice: true }
      });

      if (!payment) throw new Error("Payment not found");
      if (payment.status !== 'PENDING') throw new Error("Payment already processed");

      if (action === 'REJECT') {
        // Just mark payment as rejected, don't touch invoice
        return await tx.payment.update({
          where: { id: paymentId },
          data: { status: 'REJECTED' }
        });
      }

      // B. If APPROVING, we must calculate the new Invoice totals
      if (action === 'APPROVE') {
        // 1. Update Payment Status
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: { status: 'APPROVED' }
        });

        // 2. Calculate new totals for the Invoice
        const newAmountPaid = Number(payment.invoice.amountPaid) + Number(payment.amountPaid);
        const totalDue = Number(payment.invoice.totalAmount);

        // 3. Determine new Invoice Status
        let newInvoiceStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' = 'PARTIALLY_PAID';
        
        if (newAmountPaid >= totalDue) {
          newInvoiceStatus = 'PAID';
        }

        // 4. Update the Invoice
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            status: newInvoiceStatus
          }
        });

        return updatedPayment;
      }
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}
