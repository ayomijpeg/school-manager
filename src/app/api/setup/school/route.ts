import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SchoolType } from '@prisma/client';

const setupSchema = z.object({
  schoolName: z.string().min(3),
  schoolType: z.nativeEnum(SchoolType),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY"),
  motto: z.string().optional(),
  offersNursery: z.boolean().optional(),
  offersPrimary: z.boolean().optional(),
  offersSecondary: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = setupSchema.parse(json);
    const isTertiary = data.schoolType === SchoolType.TERTIARY;

    // --- SENIOR DEV OPTIMIZATION: 60s Timeout ---
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Session Setup
      const [startYear, endYear] = data.academicYear.split('/').map(Number);
      await tx.academicSession.upsert({
        where: { code: data.academicYear },
        update: { isCurrent: true },
        create: {
          code: data.academicYear,
          startDate: new Date(startYear, 8, 1),
          endDate: new Date(endYear, 6, 30),
          isCurrent: true,
        },
      });

      // 2. School Config
      const config = await tx.schoolConfig.upsert({
        where: { id: 'singleton-config-id' },
        update: {
          schoolName: data.schoolName,
          schoolType: data.schoolType,
          academicYear: data.academicYear,
          motto: data.motto,
          currentTerm: isTertiary ? 'First Semester' : '1st Term',
          useGPA: isTertiary,
          isSetupDone: true,
          offersNursery: data.offersNursery ?? false,
          offersPrimary: data.offersPrimary ?? false,
          offersSecondary: data.offersSecondary ?? false,
        },
        create: {
          id: 'singleton-config-id',
          schoolName: data.schoolName,
          schoolType: data.schoolType,
          academicYear: data.academicYear,
          motto: data.motto,
          currentTerm: isTertiary ? 'First Semester' : '1st Term',
          useGPA: isTertiary,
          isSetupDone: true,
          offersNursery: data.offersNursery ?? false,
          offersPrimary: data.offersPrimary ?? false,
          offersSecondary: data.offersSecondary ?? false,
        },
      });

      // 3. Hierarchy Generation (OPTIMIZED with Promise.all)
      if (isTertiary) {
        // --- TERTIARY ---
        const fac = await tx.faculty.upsert({
          where: { name: 'General Faculty' },
          update: {},
          create: { name: 'General Faculty', description: 'Default Faculty' },
        });

        await tx.department.upsert({
          where: { name: 'General Studies' },
          update: {},
          create: { name: 'General Studies', facultyId: fac.id },
        });

        const uniLevels = ['100 Level', '200 Level', '300 Level', '400 Level'];
        // PARALLEL EXECUTION
        await Promise.all(
          uniLevels.map(name => 
            tx.level.upsert({ where: { name }, update: {}, create: { name } })
          )
        );

      } else {
        // --- BASIC EDUCATION ---

        // Optimized Helper
        const createSection = async (
          facName: string, 
          facDesc: string, 
          deptName: string, 
          levels: string[]
        ) => {
          const fac = await tx.faculty.upsert({
            where: { name: facName },
            update: { description: facDesc },
            create: { name: facName, description: facDesc },
          });

          await tx.department.upsert({
            where: { name: deptName },
            update: {},
            create: { name: deptName, facultyId: fac.id },
          });

          // PARALLEL LEVEL CREATION
          await Promise.all(
            levels.map(name => 
              tx.level.upsert({ where: { name }, update: {}, create: { name } })
            )
          );
        };

        const tasks = [];

        if (data.offersNursery) {
          tasks.push(createSection(
            'Nursery Section', 'Early Years', 
            'Pre-School General', 
            ['Reception', 'Nursery 1', 'Nursery 2', 'Kindergarten']
          ));
        }

        if (data.offersPrimary) {
          tasks.push(createSection(
            'Primary Section', 'Basic 1-6', 
            'Primary General', 
            ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6']
          ));
        }

        // Run Nursery and Primary in parallel if both selected
        await Promise.all(tasks);

        if (data.offersSecondary) {
          // Secondary is complex, keep it slightly sequential to avoid logic errors, 
          // but parallelize the levels
          const jrFac = await tx.faculty.upsert({
            where: { name: 'Junior Secondary' },
            update: {},
            create: { name: 'Junior Secondary' },
          });

          const srFac = await tx.faculty.upsert({
            where: { name: 'Senior Secondary' },
            update: {},
            create: { name: 'Senior Secondary' },
          });

          const depts = [
            { name: 'Junior General', facId: jrFac.id },
            { name: 'Science', facId: srFac.id },
            { name: 'Arts', facId: srFac.id },
            { name: 'Commercial', facId: srFac.id },
          ];

          // Create Depts in Parallel
          await Promise.all(depts.map(dept => 
            tx.department.upsert({
              where: { name: dept.name },
              update: {},
              create: { name: dept.name, facultyId: dept.facId },
            })
          ));

          const secLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
          // Create Levels in Parallel
          await Promise.all(secLevels.map(name => 
             tx.level.upsert({ where: { name }, update: {}, create: { name } })
          ));
        }
      }

      return config;
    }, {
      maxWait: 10000, 
      timeout: 60000, 
    });

    return NextResponse.json({ success: true, configId: result.id });
  } catch (error) {
    console.error('[Setup Transaction Failed]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Critical Setup Failure' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const config = await prisma.schoolConfig.findFirst();
    // Return empty object if no config, but never return null/undefined body
    return NextResponse.json({ config: config || null }); 
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
