// src/app/api/students/bulk-import/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Define the shape of your expected CSV data
type StudentImportRow = {
  firstName: string;
  lastName: string;
  email: string; 
  matricNumber?: string;
  gender: 'MALE' | 'FEMALE';
  className: string;
  departmentName?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rows, academicYear, term } = body; 

    // 1. Basic Validation
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
    if (!academicYear || !term) {
      return NextResponse.json({ error: 'Academic Year and Term are required' }, { status: 400 });
    }

    // 2. FETCH LEVELS
    const levels = await prisma.level.findMany();
    const levelMap = new Map(levels.map(l => [l.name.toUpperCase(), l.id]));

    // 3. VALIDATION PHASE
    const errors: string[] = [];
    const validStudents = [];

    // --- Safety Checks ---
    const emailsToCheck = rows
      .map((r: any) => r.email)
      .filter((e: any) => e && typeof e === 'string' && e.trim() !== '');

    const manualMatrics = rows
        .filter((r: any) => r.matricNumber && r.matricNumber.trim() !== '')
        .map((r: any) => r.matricNumber);

    const existingEmails = emailsToCheck.length > 0
      ? await prisma.user.findMany({
          where: { email: { in: emailsToCheck } },
          select: { email: true }
        }) : [];
    const registeredEmails = new Set(existingEmails.map(e => e.email));

    const existingMatrics = manualMatrics.length > 0
      ? await prisma.student.findMany({
          where: { matricNumber: { in: manualMatrics } },
          select: { matricNumber: true }
        }) : [];
    const registeredMatrics = new Set(existingMatrics.map(m => m.matricNumber));

    // 4. PROCESS ROWS
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      // A. Validate Mandatory Fields
      if (!row.email || !row.firstName || !row.lastName) {
        errors.push(`Row ${rowNum}: Missing Name or Email.`);
        continue;
      }

      // B. Validate Email Uniqueness
      if (registeredEmails.has(row.email)) {
        errors.push(`Row ${rowNum}: Email ${row.email} is already taken.`);
        continue;
      }

      // C. Handle Matric Number
      let finalMatric = row.matricNumber?.trim();
      if (!finalMatric) {
        finalMatric = `ADM-${Date.now()}-${Math.floor(Math.random() * 1000) + i}`; 
      } else {
        if (registeredMatrics.has(finalMatric)) {
          errors.push(`Row ${rowNum}: Matric Number ${finalMatric} already exists.`);
          continue;
        }
      }

      // D. Resolve LEVEL ID
      const levelId = levelMap.get(row.className?.toUpperCase());
      if (!levelId) {
        errors.push(`Row ${rowNum}: Level "${row.className}" not found. Available: ${Array.from(levelMap.keys()).join(', ')}`);
        continue;
      }

      validStudents.push({ 
        ...row, 
        matricNumber: finalMatric, 
        levelId 
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }

    // 5. EXECUTION PHASE
    const defaultPassword = await bcrypt.hash('password123', 10); 

    await prisma.$transaction(async (tx) => {
      for (const student of validStudents) {
        
        // A. Create User (Credentials Only)
        const newUser = await tx.user.create({
          data: {
            email: student.email,
            passwordHash: defaultPassword, 
            role: 'STUDENT',
          }
        });

        // B. Create Student Profile
        await tx.student.create({
          data: {
            userId: newUser.id,
            // firstName: REMOVED (Not in DB)
            // lastName: REMOVED (Not in DB)
            // gender: REMOVED (Not in DB)
            fullName: `${student.firstName} ${student.lastName}`, 
            matricNumber: student.matricNumber,
            levelId: student.levelId
          }
        });
      }
    });

    return NextResponse.json({ success: true, count: validStudents.length });

  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}