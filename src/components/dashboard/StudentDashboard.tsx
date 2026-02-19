import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  BookOpen,
  Receipt,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

type Props = { studentUserId: string };

async function loadStudent(studentUserId: string) {
  return prisma.student.findUnique({
    where: { userId: studentUserId, deletedAt: null },
    include: {
      level: true,
      department: true,
      enrollments: {
        where: { academicYear: { not: '' } },
        orderBy: { academicYear: 'desc' },
        take: 1,
        include: { class: { include: { level: true } } },
      },
      results: {
        orderBy: { id: 'desc' },
        take: 5,
        include: { course: true, exam: true },
      },
      studentAttendance: {
        where: { attendanceDate: { gte: new Date(new Date().getFullYear(), 0, 1) } },
      },
      invoices: { where: { status: { not: 'PAID' } }, orderBy: { dueDate: 'desc' }, take: 3 },
    },
  });
}

function safeNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export default async function StudentDashboard({ studentUserId }: Props) {
  if (!studentUserId) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <h3 className="text-lg font-bold text-slate-700">Session error</h3>
        <p className="text-slate-500 mt-1">Please log in again.</p>
      </div>
    );
  }

  let student: Awaited<ReturnType<typeof loadStudent>>;
  try {
    student = await loadStudent(studentUserId);
  } catch (err) {
    console.error('StudentDashboard load error:', err);
    return (
      <div className="p-8 text-center border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50">
        <h3 className="text-lg font-bold text-slate-700">Something went wrong</h3>
        <p className="text-slate-500 mt-1">We couldn’t load your dashboard. Please try again or contact support.</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <h3 className="text-lg font-bold text-slate-700">Profile not found</h3>
        <p className="text-slate-500 mt-1">This account is not linked to a student profile.</p>
      </div>
    );
  }

  const firstName = student.fullName.split(' ')[0] || student.fullName;
  const currentEnrollment = student.enrollments[0];
  const classLabel = currentEnrollment?.class
    ? `${currentEnrollment.class.level?.name ?? ''} ${currentEnrollment.class.name}`.trim()
    : student.level?.name ?? 'Unassigned';

  const totalAttendance = student.studentAttendance.length;
  const presentCount = student.studentAttendance.filter((a) => a.status === 'PRESENT').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : null;

  const unpaidBalance = student.invoices.reduce(
    (sum, inv) => sum + (safeNum(inv.totalAmount) - safeNum(inv.amountPaid)),
    0
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-800 border border-emerald-200">
            {student.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {greeting()}, {firstName}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {classLabel} • {format(new Date(), 'EEEE, MMM d')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {attendanceRate !== null && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Attendance</p>
              <p className="text-xl font-bold text-slate-900">{attendanceRate}%</p>
              <p className="text-xs text-slate-500">This term</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Balance due</p>
            <p className="text-xl font-bold text-slate-900">₦ {unpaidBalance.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{student.invoices.length} unpaid</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Results</p>
            <p className="text-xl font-bold text-slate-900">{student.results.length} recent</p>
            <Link href="/dashboard/results" className="text-xs text-emerald-600 hover:underline font-medium">
              View report card
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Recent results */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Recent results
            </h2>
            {student.results.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                No results yet. They will appear here after your teachers upload scores.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {student.results.map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{r.course?.name ?? 'Course'}</p>
                      <p className="text-xs text-slate-500">{r.exam?.name ?? 'Assessment'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{r.grade ?? '—'}</span>
                      <span className="text-slate-500 text-sm ml-1">({safeNum(r.totalScore)}%)</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/results" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
              View full report card →
            </Link>
          </section>

          {/* Pending invoices */}
          {student.invoices.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" /> Pending invoices
              </h2>
              <ul className="space-y-2">
                {student.invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="font-mono text-sm text-slate-600">{inv.invoiceNumber}</span>
                    <span className="font-medium">₦ {(safeNum(inv.totalAmount) - safeNum(inv.amountPaid)).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/billing" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
                Pay or view all →
              </Link>
            </section>
          )}
        </div>

        {/* Sidebar: Quick links */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/results"
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                >
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Report card</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                >
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">My invoices</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/parents/timetable"
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                >
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Timetable</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
