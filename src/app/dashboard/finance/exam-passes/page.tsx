export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import RefreshButton from '@/components/ui/RefreshButton';
import PrintButton from '@/components/ui/PrintButton';

type SearchParams = Promise<{ levelId?: string; status?: string }>;

export default async function ExamPassesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const selectedLevelId = params.levelId || '';
  const filterStatus = params.status || 'cleared'; // 'all', 'cleared', 'uncleared'

  const [config, levels] = await Promise.all([
    prisma.schoolConfig.findFirst(),
    prisma.level.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Fetch students with their invoices to calculate financial clearance
  const students = await prisma.student.findMany({
    where: {
      deletedAt: null,
      ...(selectedLevelId ? { levelId: selectedLevelId } : {}),
    },
    include: {
      level: true,
      invoices: {
        where: { status: { not: 'CANCELLED' } },
        select: {
          totalAmount: true,
          amountPaid: true,
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  // Calculate balance for each student
  const studentsWithBalance = students.map((s) => {
    const totalBilled = s.invoices.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const totalPaid = s.invoices.reduce((acc, curr) => acc + Number(curr.amountPaid), 0);
    const balance = totalBilled - totalPaid;
    const isCleared = balance <= 0;
    return {
      ...s,
      totalBilled,
      totalPaid,
      balance,
      isCleared,
    };
  });

  // Filter based on selected filter
  const displayedStudents = studentsWithBalance.filter((s) => {
    if (filterStatus === 'cleared') return s.isCleared;
    if (filterStatus === 'uncleared') return !s.isCleared;
    return true;
  });

  const schoolName = config?.schoolName || 'Yosola Schools';
  const academicYear = config?.academicYear || '2025/2026';
  const currentTerm = config?.currentTerm || 'Third Term';

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      {/* NO-PRINT CONTROLS */}
      <div className="max-w-6xl mx-auto print:hidden mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/dashboard/finance"
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={12} /> Back to Finance Ledger
              </Link>
            </div>
            <h1 className="text-3xl font-serif text-slate-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-emerald-600 w-8 h-8" />
              Examination Clearance Passes (Dockets)
            </h1>
            <p className="text-slate-500 mt-1">
              Print official wallet-sized exam passes for students who have settled their school fees.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RefreshButton />
            <PrintButton label="Print Passes" />
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

            <select
              name="status"
              defaultValue={filterStatus}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="cleared">Cleared Students Only (₦0 Balance)</option>
              <option value="all">All Enrolled Students</option>
              <option value="uncleared">Uncleared / Owing Only</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Apply Filter
            </button>

            <div className="ml-auto text-xs text-slate-500 font-medium">
              Showing <strong>{displayedStudents.length}</strong> pass
              {displayedStudents.length !== 1 ? 'es' : ''}
            </div>
          </form>
        </div>
      </div>

      {/* PRINTABLE DOCKETS GRID */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-4">
          {displayedStudents.map((s) => (
            <div
              key={s.id}
              className="border-2 border-dashed border-slate-300 print:border-slate-400 p-4 rounded-xl bg-white shadow-sm print:shadow-none print:break-inside-avoid relative overflow-hidden"
            >
              {/* WATERMARK EMBLEM */}
              <div className="absolute right-2 -bottom-4 text-slate-100 print:text-slate-200 -z-0 pointer-events-none select-none">
                <ShieldCheck size={140} strokeWidth={1} />
              </div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* DOCKET HEADER */}
                <div className="border-b-2 border-slate-900 pb-2 mb-3 text-center">
                  <h3 className="text-base font-black tracking-tight uppercase text-slate-900">
                    {schoolName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Examination Clearance Pass
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    {academicYear} Academic Session • {currentTerm}
                  </p>
                </div>

                {/* STUDENT INFO & PHOTO */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-lg font-serif">
                    {s.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 leading-tight">{s.fullName}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-600 mt-1">
                      <span>
                        <strong>Adm No:</strong> {s.matricNumber || '—'}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Class:</strong> {s.level?.name || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CLEARANCE BADGE */}
                <div
                  className={`p-2 rounded-lg text-center mb-3 border ${
                    s.isCleared
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                    {s.isCleared ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Cleared For Examinations</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span>Provisional — Outstanding Fee: {formatCurrency(s.balance)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* FOOTER SIGNATURE & VERIFICATION */}
                <div className="flex items-end justify-between pt-2 border-t border-slate-200 text-[9px] text-slate-500">
                  <div>
                    <p>Issue Date: {formatDate(new Date())}</p>
                    <p className="font-mono text-[8px]">REF: PASS-{s.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-28 border-b border-slate-400 mb-0.5"></div>
                    <p className="uppercase font-semibold text-slate-600">Bursar / Accounts Seal</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {displayedStudents.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl">
              <ShieldCheck size={48} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No students found for this criteria</h3>
              <p className="text-sm text-slate-400 mt-1">
                Try selecting a different level or changing the clearance status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
