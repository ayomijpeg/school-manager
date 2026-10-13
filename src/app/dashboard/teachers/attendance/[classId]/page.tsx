import { prisma } from '@/lib/prisma';
import AttendanceRegister from '@/components/teachers/AttendanceRegister';
import { notFound } from 'next/navigation';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ courseId?: string; date?: string; mode?: string }>;
};

export default async function AttendancePage({ params, searchParams }: PageProps) {
  const { classId } = await params;
  const { courseId, date, mode } = await searchParams;
  
  // 1. Fetch Class Details
  const classData = await prisma.class.findUnique({ where: { id: classId } });
  if (!classData) return notFound();

  // 2. Resolve Effective Course (allows Morning Roll Call without forcing course selection)
  let effectiveCourseId = courseId;
  let courseName = '☀ Morning Roll Call';

  if (effectiveCourseId) {
    const course = await prisma.course.findUnique({ where: { id: effectiveCourseId } });
    if (course) courseName = course.name;
  } else {
    // If homeroom/morning mode, pick level course or first available course in DB
    const fallbackCourse = await prisma.course.findFirst({ where: { levelId: classData.levelId } })
      || await prisma.course.findFirst();
    
    if (fallbackCourse) {
      effectiveCourseId = fallbackCourse.id;
    }
  }

  if (!effectiveCourseId) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
        <h2 className="font-bold text-lg">No Course Configured</h2>
        <p className="text-sm mt-1">Please create at least one subject or course in the system to enable attendance registers.</p>
      </div>
    );
  }

  // Default to today if no date picked
  const selectedDate = date ? new Date(date) : new Date();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // 3. Fetch Students + Attendance + Parents for THIS specific date
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          parents: {
            include: { parent: true }
          },
          studentAttendance: {
            where: { 
              courseId: effectiveCourseId,
              attendanceDate: selectedDate 
            }
          }
        }
      }
    },
    orderBy: { student: { fullName: 'asc' } }
  });

  // 4. Format for Client Component with Parent Info
  const students = enrollments.map(en => ({
    studentId: en.student.id,
    name: en.student.fullName,
    status: (en.student.studentAttendance[0]?.status) || 'PRESENT' as const,
    parentName: en.student.parents[0]?.parent?.fullName || null,
    parentPhone: en.student.parents[0]?.parent?.contactPhone || en.student.contactPhone || null,
  }));

  const isMorning = mode === 'morning' || !courseId;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link
          href="/dashboard/teachers/attendance"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider gap-1"
        >
          <ArrowLeft size={12} /> Back to Attendance Hub
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {isMorning ? 'Daily Morning Roll Call' : 'Attendance Register'}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {courseName}
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            {classData.name} • <span className="text-emerald-700 font-semibold">{format(selectedDate, 'PPPP')}</span>
          </p>
        </div>

        {/* Date Picker */}
        <form method="GET" className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <CalendarDays className="w-5 h-5 text-slate-400" />
          {courseId && <input type="hidden" name="courseId" value={courseId} />}
          {mode && <input type="hidden" name="mode" value={mode} />}
          <input 
            type="date" 
            name="date" 
            defaultValue={dateStr}
            className="outline-none text-sm text-slate-700 font-medium bg-transparent"
            aria-label="Select Attendance Date"
          />
          <button type="submit" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-2">
            Go
          </button>
        </form>
      </div>

      <AttendanceRegister 
        classId={classId} 
        courseId={effectiveCourseId} 
        date={dateStr}
        students={students}
        className={classData.name}
      />
    </div>
  );
}
