export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ArrowLeft, Printer, IdCard, Layers, ShieldCheck, User } from 'lucide-react';
import RefreshButton from '@/components/ui/RefreshButton';
import PrintButton from '@/components/ui/PrintButton';
import StudentPhotoUpload from '@/components/students/StudentPhotoUpload';

type SearchParams = Promise<{ levelId?: string; query?: string }>;

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
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      {/* NO-PRINT CONTROLS */}
      <div className="max-w-6xl mx-auto print:hidden mb-8">
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
              Generate standardized printable ID cards (8 per page) for lamination or PVC card stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RefreshButton />
            <PrintButton label="Print All Cards" />
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
              placeholder="Search by student name..."
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none flex-1 max-w-xs"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Filter
            </button>

            <div className="ml-auto text-xs text-slate-500 font-medium">
              Ready to print: <strong>{students.length}</strong> card{students.length !== 1 ? 's' : ''}
            </div>
          </form>
        </div>
      </div>

      {/* PRINTABLE CARDS GRID (A4 SHEET: 2 COLUMNS x 4 ROWS = 8 CARDS PER PAGE) */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3">
          {students.map((student) => {
            const emergencyPhone = student.parents[0]?.parent?.contactPhone || student.contactPhone || '—';

            return (
              <div
                key={student.id}
                className="border-2 border-dashed border-slate-300 print:border-slate-400 rounded-2xl p-4 bg-white shadow-sm print:shadow-none print:break-inside-avoid relative overflow-hidden"
                style={{ minHeight: '220px' }}
              >
                {/* ID CARD HEADER */}
                <div className="bg-emerald-800 text-white p-3 -mx-4 -mt-4 mb-3 rounded-t-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white text-emerald-800 rounded-full flex items-center justify-center font-black text-xs">
                      Y
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider leading-tight">
                        {schoolName}
                      </h3>
                      <p className="text-[9px] text-emerald-200 leading-none">{schoolMotto}</p>
                    </div>
                  </div>
                  <span className="text-[8px] bg-emerald-900/60 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    STUDENT ID
                  </span>
                </div>

                {/* CARD BODY: PHOTO + DETAILS */}
                <div className="flex gap-3 items-center mb-3">
                  {/* PASSPORT PHOTO */}
                  <div className="w-16 h-20 bg-slate-100 border-2 border-emerald-600 rounded-lg flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden group">
                    {student.photoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={student.photoUrl}
                        alt={student.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-slate-50 to-emerald-50 flex items-center justify-center font-bold text-xl text-emerald-800 font-serif">
                        {student.fullName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[7px] text-white text-center py-0.5 uppercase tracking-tighter z-10">
                      OFFICIAL
                    </span>
                    <StudentPhotoUpload
                      studentId={student.id}
                      studentName={student.fullName}
                      currentPhoto={student.photoUrl}
                      variant="overlay"
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-slate-900 truncate uppercase tracking-tight">
                      {student.fullName}
                    </h4>

                    <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                      <p>
                        <span className="text-slate-400 w-16 inline-block font-semibold">Adm No:</span>
                        <strong className="font-mono text-slate-900">{student.matricNumber || 'PENDING'}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400 w-16 inline-block font-semibold">Class:</span>
                        <strong className="text-slate-800">{student.level?.name || '—'}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400 w-16 inline-block font-semibold">Session:</span>
                        <span>{academicYear}</span>
                      </p>
                      <p>
                        <span className="text-slate-400 w-16 inline-block font-semibold">Emergency:</span>
                        <span className="font-mono text-[10px] text-slate-700">{emergencyPhone}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[8px] text-slate-400">
                  <span>Card Ref: YOS-{student.id.slice(0, 6).toUpperCase()}</span>
                  <div className="text-right">
                    <span className="border-t border-slate-300 px-3 uppercase font-bold text-slate-500">
                      Principal Signature
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {students.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl">
              <IdCard size={48} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No students found</h3>
              <p className="text-sm text-slate-400 mt-1">Try selecting a different level or clearing filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
