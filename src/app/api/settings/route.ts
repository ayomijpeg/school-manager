import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // 1. Check if ANY config exists
    const existingConfig = await prisma.schoolConfig.findFirst();

    let config;

    if (existingConfig) {
      // 2. UPDATE existing record (using its real ID)
      config = await prisma.schoolConfig.update({
        where: { id: existingConfig.id },
        data: {
          schoolName: body.schoolName,
          motto: body.motto,
          address: body.address,
          website: body.website,
          email: body.email,
          phone: body.phone,
          academicYear: body.academicYear,
          currentTerm: body.currentTerm,
          bankName: body.bankName,
          accountNumber: body.accountNumber,
          accountName: body.accountName,
          paymentInstructions: body.paymentInstructions,
        }
      });
    } else {
      // 3. CREATE new record if table is empty
      config = await prisma.schoolConfig.create({
        data: {
          schoolName: body.schoolName || "My School",
          academicYear: body.academicYear || "2025/2026",
          currentTerm: body.currentTerm || "First Term",
          motto: body.motto,
          address: body.address,
          website: body.website,
          email: body.email,
          phone: body.phone,
          bankName: body.bankName,
          accountNumber: body.accountNumber,
          accountName: body.accountName,
          paymentInstructions: body.paymentInstructions,
        }
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
