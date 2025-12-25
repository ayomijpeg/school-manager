import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Timetable from '@/components/parents/Timetable';
import { CalendarDays, Clock, Info } from 'lucide-react';

export default async function TimetablePage() {
  const user = await getCurrentUser();

  if (!user) redirect('/auth/login');

  // Fetch wards so the parent can see which child's timetable they are viewing
  const parent = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      students: {
        include: {
          student: {
            include: { level: true }
          }
        }
      }
    }
  });

  const wards = parent?.students.map(link => link.student) || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
            <CalendarDays className="text-emerald-600" />
            Class Timetable
          </h1>
          <p className="text-slate-500 text-sm mt-1">Weekly academic schedule and period breakdown.</p>
        </div>

        {/* Child Selector (Simplified for now) */}
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-slate-400 px-2 uppercase">Ward:</span>
          <select className="bg-transparent text-sm font-bold outline-none dark:text-white cursor-pointer">
            {wards.map(w => (
              <option key={w.id} value={w.id}>{w.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Alert */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300">
        <Info size={18} />
        <p className="text-xs font-medium">Periods are 60 minutes long. Break periods are mandatory for all students.</p>
      </div>

      {/* Main Timetable Component */}
      <div className="grid grid-cols-1">
        <Timetable />
      </div>

      {/* Footer / Legend */}
      <div className="flex flex-wrap gap-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-xs text-slate-500 font-medium">Core Subjects</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-xs text-slate-500 font-medium">Electives</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-300 rounded-full" />
          <span className="text-xs text-slate-500 font-medium">Breaks</span>
        </div>
      </div>
    </div>
  );
}
