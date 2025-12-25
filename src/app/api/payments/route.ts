// src/app/api/payments/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, InvoiceStatus } from '@prisma/client';

const paymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid Invoice ID'),
  amountPaid: z.number().positive('Amount must be greater than 0'),
  paymentDate: z.string().date('Invalid payment date'),
  paymentMethod: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = paymentSchema.parse(body);

    const newPayment = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: data.invoiceId },
        select: { totalAmount: true, payments: true },
      });

      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amountPaid: data.amountPaid, // Prisma handles number -> Decimal conversion
          paymentDate: new Date(data.paymentDate),
          paymentMethod: data.paymentMethod,
        },
      });

      // Step C: Determine the new status
      // FIX 3: Convert Decimals to numbers for math
      const totalPaidSoFar =
        invoice.payments.reduce(
          (sum, p) => sum + p.amountPaid.toNumber(), // <-- Convert here
          0,
        ) + data.amountPaid;

      let newStatus: InvoiceStatus = 'PENDING';

      // FIX 4: Convert Decimal to number for comparison
      if (totalPaidSoFar >= invoice.totalAmount.toNumber()) { // <-- Convert here
        newStatus = 'PAID';
      } else if (totalPaidSoFar > 0) {
        newStatus = 'PENDING'; 
      }

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          status: newStatus,
        },
      });

      return payment;
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'The specified Invoice does not exist.' },
          { status: 404 },
        );
      }
    }
    
    console.error(error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
