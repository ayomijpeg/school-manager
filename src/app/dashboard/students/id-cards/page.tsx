export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ArrowLeft, Printer, IdCard, Layers, ShieldCheck, User } from 'lucide-react';
import RefreshButton from '@/components/ui/RefreshButton';
import StudentIdCardsClient from '@/components/students/StudentIdCardsClient';

type SearchParams = Promise<{
  levelId?: string;
  query?: string;
  studentId?: string;
  autoPrint?: string;
}>;

export default async function StudentIdCardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const selectedLevelId = params.levelId || '';
  const query = params.query || '';
  const initialStudentId = params.studentId || '';
  const initialAutoPrint = params.autoPrint === 'true';

  const [config, levels, students] = await Promise.all([
    prisma.schoolConfig.findFirst(),
    prisma.level.findMany({ orderBy: { name: 'asc' } }),
    prisma.student.findMany({
      where: {
        deletedAt: null,
        ...(selectedLevelId ? { levelId: selectedLevelId } : {}),
        ...(query
          ? {
              OR: [
                { fullName: { contains: query, mode: 'insensitive' as const } },
                { matricNumber: { contains: query, mode: 'insensitive' as const } },
              ]
            }
          : {}),
      },
      include: {
        level: true,
        parents: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  const schoolName = config?.schoolName || 'YOSOLA SCHOOLS';
  const academicYear = config?.academicYear || '2025/2026';
  const schoolMotto = config?.motto || 'Knowledge, Discipline & Excellence';

  return (
    <div className="p-6 md:p-8 min-h-screen print:min-h-0 print:p-0 print:m-0 bg-[#FDFDFC] print:bg-white">
      {/* NO-PRINT CONTROLS */}
      <div className="max-w-6xl mx-auto print:hidden mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/dashboard/students"
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={12} /> Back to Student Directory
              </Link>
            </div>
            <h1 className="text-3xl font-serif text-slate-900 tracking-tight flex items-center gap-3">
              <IdCard className="text-emerald-700 w-8 h-8" />
              Student ID Card Printing Suite
            </h1>
            <p className="text-slate-500 mt-1">
              Print individual student ID cards or batch-select specific students for printing (8 per A4 sheet).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RefreshButton />
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mt-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <form method="GET" className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <select
                name="levelId"
                defaultValue={selectedLevelId}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="">All Classes / Levels</option>
                {levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search by student name or adm no..."
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none flex-1 max-w-xs"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Filter
            </button>

            <div className="ml-auto text-xs text-slate-500 font-medium">
              Total matched: <strong>{students.length}</strong> card{students.length !== 1 ? 's' : ''}
            </div>
          </form>
        </div>
      </div>

      {/* INTERACTIVE PRINTABLE CLIENT COMPONENT */}
      <StudentIdCardsClient
        students={students}
        schoolName={schoolName}
        academicYear={academicYear}
        schoolMotto={schoolMotto}
        initialStudentId={initialStudentId}
        initialAutoPrint={initialAutoPrint}
      />
    </div>
  );
}
