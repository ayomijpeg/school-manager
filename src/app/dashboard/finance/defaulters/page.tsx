export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ArrowLeft, AlertCircle, Users, Wallet, Printer, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import RefreshButton from '@/components/ui/RefreshButton';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { buildFeeReminderMessage } from '@/lib/whatsapp';

type SearchParams = Promise<{ levelId?: string; query?: string }>;

export default async function FeeDefaultersPage({
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
  const query = params.query || '';

  // Fetch school config and levels
  const [config, levels] = await Promise.all([
    prisma.schoolConfig.findFirst(),
    prisma.level.findMany({ orderBy: { name: 'asc' } }),
  ]);

  // Fetch all invoices that have an unpaid balance and are not cancelled
  const rawInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
      ...(selectedLevelId ? { student: { levelId: selectedLevelId } } : {}),
      ...(query
        ? {
            OR: [
              { student: { fullName: { contains: query, mode: 'insensitive' as const } } },
              { student: { matricNumber: { contains: query, mode: 'insensitive' as const } } },
              { invoiceNumber: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    include: {
      student: {
        include: {
          level: true,
          parents: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  // Calculate unpaid balances (ensure totalAmount > amountPaid)
  const defaulters = rawInvoices
    .map((inv) => {
      const totalAmount = Number(inv.totalAmount);
      const amountPaid = Number(inv.amountPaid);
      const balance = totalAmount - amountPaid;
      const primaryParent = inv.student.parents[0]?.parent;
      return {
        ...inv,
        totalAmount,
        amountPaid,
        balance,
        parentName: primaryParent?.fullName || null,
        parentPhone: primaryParent?.contactPhone || inv.student.contactPhone || null,
      };
    })
    .filter((inv) => inv.balance > 0);

  const totalOutstanding = defaulters.reduce((acc, curr) => acc + curr.balance, 0);
  const totalBilled = defaulters.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCollected = defaulters.reduce((acc, curr) => acc + curr.amountPaid, 0);

  const schoolName = config?.schoolName || 'Yosola Schools';

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 print:hidden">
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
            <AlertCircle className="text-amber-500 w-8 h-8" />
            Fee Debtors & Defaulters
          </h1>
          <p className="text-slate-500 mt-1">
            Track unpaid student bills and recover outstanding revenue via 1-click WhatsApp reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RefreshButton />
          <Link
            href="/dashboard/finance/exam-passes"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 text-white font-bold rounded-xl text-sm hover:bg-emerald-900 transition-all shadow-sm"
          >
            Exam Clearance Passes
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 print:hidden">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Outstanding</span>
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Unpaid balance across {defaulters.length} accounts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Defaulters</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {defaulters.length} Students
          </p>
          <p className="text-xs text-slate-400 mt-1">Pupils owing school fees</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Partial Payments</span>
            <AlertCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            {formatCurrency(totalCollected)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Partially paid of {formatCurrency(totalBilled)} billed</p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden">
        <form method="GET" className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search student name or matric number..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Filter
          </button>
          {(selectedLevelId || query) && (
            <Link
              href="/dashboard/finance/defaulters"
              className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
            >
              Clear filters
            </Link>
          )}
        </form>
      </div>

      {/* DEFAULTERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* PRINT HEADER */}
        <div className="hidden print:block p-6 text-center border-b border-slate-200">
          <h2 className="text-2xl font-black uppercase">{schoolName}</h2>
          <p className="text-sm font-bold text-slate-600 uppercase">Outstanding School Fees & Debtors List</p>
          <p className="text-xs text-slate-400 mt-1">Generated: {formatDate(new Date())}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Student Details</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Parent / Contact</th>
                <th className="px-4 py-4 text-right">Invoiced</th>
                <th className="px-4 py-4 text-right">Paid</th>
                <th className="px-4 py-4 text-right">Balance Due</th>
                <th className="px-6 py-4 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defaulters.map((inv) => {
                const message = buildFeeReminderMessage({
                  parentName: inv.parentName,
                  studentName: inv.student.fullName,
                  className: inv.student.level?.name,
                  amountDue: inv.balance,
                  invoiceNumber: inv.invoiceNumber,
                  term: config?.currentTerm,
                  schoolName: config?.schoolName,
                  bankName: config?.bankName,
                  accountNumber: config?.accountNumber,
                  accountName: config?.accountName,
                });

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/dashboard/students/${inv.student.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          {inv.student.fullName}
                        </Link>
                        {inv.student.matricNumber && (
                          <p className="text-xs text-slate-400 font-mono">{inv.student.matricNumber}</p>
                        )}
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">#{inv.invoiceNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                        {inv.student.level?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{inv.parentName || 'Parent'}</p>
                        <p className="text-xs text-slate-500 font-mono">{inv.parentPhone || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-emerald-600">
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                        {formatCurrency(inv.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center print:hidden">
                      <div className="flex items-center justify-center gap-2">
                        <WhatsAppButton
                          phone={inv.parentPhone}
                          message={message}
                          label="Send Reminder"
                          variant="secondary"
                          title={`Send WhatsApp fee reminder to ${inv.parentName || 'parent'}`}
                        />
                        <Link
                          href={`/dashboard/finance/${inv.id}`}
                          className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                          View Bill
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {defaulters.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      ✓
                    </div>
                    <p className="font-bold text-slate-700">No outstanding fee defaulters found!</p>
                    <p className="text-xs text-slate-400 mt-1">All filtered invoices are completely settled or none match criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
