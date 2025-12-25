import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { invoiceId, amount, method, reference, paymentDate } = body;

    // Create the Payment record with PENDING status
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoiceId,
        amountPaid: amount,          // Matches your model
        paymentMethod: method,       // Matches your model
        reference: reference,        // Matches your model
        paymentDate: new Date(paymentDate), // Matches your model
        status: 'PENDING',           // New field for admin verification
        recordedBy: user.id          // Track that the parent submitted it
      }
    });

    return NextResponse.json({ success: true, payment });

  } catch (error) {
    console.error("Payment Claim Error:", error);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}
