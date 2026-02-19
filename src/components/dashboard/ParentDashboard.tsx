import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Wallet, FileText, Receipt, Calendar, User } from 'lucide-react';
import WardCard from '../parents/WardCard';
import Timetable from '../parents/Timetable';
import AcademicSummary from '../parents/AcademicSummary';

const DAYS: Record<number, 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'> = {
  1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY', 0: 'SUNDAY',
};

type Props = { parentUserId: string };

type RichParent = Prisma.ParentGetPayload<{
  include: {
    students: {
      include: {
        student: {
          include: {
            level: true;
            invoices: {
              where: { status: { not: 'PAID' } };
              orderBy: { issueDate: 'desc' };
            };
            results: {
              include: { course: true; exam: true };
              orderBy: { id: 'desc' };
              take: 5;
            };
          };
        };
      };
    };
  };
}>;

export default async function ParentDashboard({ parentUserId }: Props) {
  const parent = await prisma.parent.findUnique({
    where: { userId: parentUserId },
    include: {
      students: {
        include: {
          student: {
            include: {
              level: true,
              invoices: {
                where: { status: { not: 'PAID' } },
                orderBy: { issueDate: 'desc' },
              },
              results: {
                include: { course: true, exam: true },
                orderBy: { id: 'desc' },
                take: 5,
              },
            },
          },
        },
      },
    },
  }) as RichParent | null;

  if (!parent) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <p className="text-slate-600 font-medium">Record not found.</p>
      </div>
    );
  }

  const wards = parent.students.map((link) => link.student);
  const firstName = parent.fullName.split(' ')[0] || parent.fullName;

  let totalOutstanding = 0;
  wards.forEach((s) => {
    s.invoices.forEach((inv) => {
      totalOutstanding += Number(inv.totalAmount) - Number(inv.amountPaid || 0);
    });
  });

  const allRecentResults = wards.flatMap((s) => s.results).slice(0, 5);

  // Dynamic today's schedule from timetable slots for wards' classes
  const wardIds = wards.map((w) => w.id);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: { in: wardIds } },
    orderBy: { academicYear: 'desc' },
    select: { studentId: true, classId: true },
  });
  const studentToClass = new Map<string, string>();
  for (const e of enrollments) {
    if (!studentToClass.has(e.studentId)) studentToClass.set(e.studentId, e.classId);
  }
  const classIds = [...new Set(studentToClass.values())];
  const todayDay = DAYS[new Date().getDay()];
  const slots =
    classIds.length > 0
      ? await prisma.timetableSlot.findMany({
          where: { classId: { in: classIds }, day: todayDay },
          include: { course: true },
          orderBy: { startTime: 'asc' },
        })
      : [];
  const todaySchedule = slots.map((s) => ({
    time: s.startTime,
    subject: s.course?.name ?? '—',
    type: (s.type === 'LESSON' ? 'Core' : s.type === 'EXAM' ? 'Other' : 'Core') as 'Core' | 'Elective' | 'Science' | 'Other',
  }));

  // Latest event for newsletter/announcements
  const latestEvent = await prisma.event.findFirst({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    select: { id: true, title: true, startTime: true, description: true },
  });

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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            {greeting()}, {firstName}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here’s what’s happening with your wards.
          </p>
        </div>
        <div className="bg-emerald-800 text-white p-5 rounded-2xl flex items-center gap-4 shadow-lg min-w-[200px]">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total balance due</p>
            <p className="text-xl font-bold">₦ {totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          <Receipt className="w-4 h-4" /> Pay fees
        </Link>
        <Link
          href="/dashboard/results"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <FileText className="w-4 h-4" /> Report cards
        </Link>
        <Link
          href="/dashboard/parents/timetable"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Calendar className="w-4 h-4" /> Timetable
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wards */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-emerald-600" /> Your wards
            </h2>
            {wards.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-sm">No wards linked to your account yet.</p>
                <p className="text-slate-400 text-xs mt-1">Contact the school to link your children.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wards.map((w) => (
                  <WardCard key={w.id} ward={w} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AcademicSummary results={allRecentResults} />
          <Timetable schedule={todaySchedule} />
          {/* Dynamic newsletter / next event */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2">School updates</h3>
            {latestEvent ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase font-medium">Next event</p>
                <p className="font-medium text-slate-900">{latestEvent.title}</p>
                {latestEvent.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">{latestEvent.description}</p>
                )}
                <Link
                  href="/dashboard/events"
                  className="inline-block text-sm font-medium text-emerald-700 hover:underline"
                >
                  View calendar →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Check the events page for the latest news and announcements.</p>
                <Link
                  href="/dashboard/events"
                  className="inline-block text-sm font-medium text-emerald-700 hover:underline"
                >
                  View events →
                </Link>
              </div>
            )}
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Quick links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/billing" className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-2 py-1.5">
                  <Receipt className="w-4 h-4 text-slate-400" /> Invoices & billing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/results" className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-2 py-1.5">
                  <FileText className="w-4 h-4 text-slate-400" /> Report cards
                </Link>
              </li>
              <li>
                <Link href="/dashboard/parents/timetable" className="text-sm text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-2 py-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Timetable
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
