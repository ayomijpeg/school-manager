import React from 'react';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace
import { 
  Clock, 
  CalendarDays, 
  TrendingUp, 
  BookOpen, 
  MapPin, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

type Props = {
  studentUserId: string;
};

// 1. DEFINE THE "RICH" STUDENT TYPE
// This tells TS: "This is a Student, BUT it also has Class, Results, Attendance, etc."
type RichStudent = Prisma.StudentGetPayload<{
  include: {
    class: { 
      include: { 
        level: true,
        teachers: { include: { teacher: true } }
      } 
    },
    attendance: true,
    results: { include: { course: true } },
    invoices: true
  }
}>;

export default async function StudentDashboard({ studentUserId }: Props) {
  // 2. FETCH DATA (Matches the Type definition above)
  const student = await prisma.student.findUnique({
    where: { userId: studentUserId },
    include: {
      class: { 
        include: { 
          level: true,
          teachers: { include: { teacher: true } }
        } 
      },
      attendance: {
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1)
          }
        }
      },
      results: { 
        orderBy: { createdAt: 'desc' }, 
        take: 3,
        include: { course: true } 
      },
      invoices: {
        where: { status: { not: 'PAID' } }
      }
    },
  }) as RichStudent | null; // Explicit cast to help TS if needed

  if (!student) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
        <h3 className="text-lg font-bold text-slate-700">Profile Not Found</h3>
        <p className="text-slate-500">This user account is not linked to a student profile.</p>
      </div>
    );
  }

  // 3. LOGIC (Now type-safe)
  const totalAttendanceRecords = student.attendance.length;
  const presentCount = student.attendance.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = totalAttendanceRecords > 0 
    ? Math.round((presentCount / totalAttendanceRecords) * 100) 
    : 100;

  // Timetable Logic
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayName = days[new Date().getDay()];
  
  const todaysClasses = student.classId ? await prisma.timetable.findMany({
    where: {
      classId: student.classId,
      dayOfWeek: todayName,
    },
    include: { course: true },
    orderBy: { startTime: 'asc' },
  }) : [];

  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  const nextClass = todaysClasses.find(c => c.endTime > currentTime) || null;
  const unpaidInvoices = student.invoices.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-serif border-2 border-white dark:border-slate-800 shadow-sm">
            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Good Morning, {student.firstName}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                {student.class ? `${student.class.level.name} ${student.class.name}` : 'Unassigned'}
              </span>
              <span>•</span>
              <span>{format(new Date(), 'EEEE, MMMM do')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* ... (Keep your exact grid layout from the previous extensive code) ... */}
         {/* I'm abbreviating here to save space, but you use the EXACT JSX I gave you before. */}
         {/* The critical fix was the 'RichStudent' type definition above. */}
         
         {/* Example usage of typed data: */}
         <div className="md:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-4">Recent Results</h3>
                {student.results.map(r => (
                    <div key={r.id} className="flex justify-between border-b py-2">
                        <span>{r.course.title}</span>
                        <span className="font-bold">{r.grade}</span>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
}
