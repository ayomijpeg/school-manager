import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const paymentConfigSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  paymentInstructions: z.string().optional(),
});

// GET: Fetch current settings
export async function GET() {
  const config = await prisma.schoolConfig.findFirst({
    select: {
      bankName: true,
      accountNumber: true,
      accountName: true,
      paymentInstructions: true,
    }
  });
  return NextResponse.json(config || {});
}

// PATCH: Update settings
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const data = paymentConfigSchema.parse(body);

    // Update the FIRST config found (Singleton pattern)
    // We get the ID first to ensure we update the correct record
    const existingConfig = await prisma.schoolConfig.findFirst();
    
    if (!existingConfig) {
      return NextResponse.json({ error: 'System not setup' }, { status: 400 });
    }

    const updated = await prisma.schoolConfig.update({
      where: { id: existingConfig.id },
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        paymentInstructions: data.paymentInstructions,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
