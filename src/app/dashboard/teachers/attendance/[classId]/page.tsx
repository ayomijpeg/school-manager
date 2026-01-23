import { prisma } from '@/lib/prisma';
import AttendanceRegister from '@/components/teachers/AttendanceRegister';
import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

// ✅ Fix: Define Page Props correctly for Next.js
type PageProps = {
  params: { classId: string };
  searchParams: { courseId?: string; date?: string };
};

export default async function AttendancePage({ params, searchParams }: PageProps) {
  const { classId } = params;
  const { courseId, date } = searchParams;
  
  // Default to today if no date picked
  const selectedDate = date ? new Date(date) : new Date();
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  if (!courseId) return <div className="p-8 text-red-500">Missing Course ID</div>;

  // 1. Fetch Class Details
  const classData = await prisma.class.findUnique({ where: { id: classId } });
  if (!classData) return notFound();

  // 2. Fetch Students + Attendance for THIS specific date
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          studentAttendance: {
            where: { 
              courseId: courseId,
              attendanceDate: selectedDate 
            }
          }
        }
      }
    },
    orderBy: { student: { fullName: 'asc' } }
  });

  // 3. Format for Client Component
  // We strictly map to match the type expected by AttendanceRegister
  const students = enrollments.map(en => ({
    studentId: en.student.id,
    name: en.student.fullName,
    // Cast strict type or fallback to 'PRESENT'
    status: (en.student.studentAttendance[0]?.status) || 'PRESENT' 
  }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1>
          <p className="text-gray-500">
            {classData.name} • <span className="text-indigo-600 font-medium">{format(selectedDate, 'PPPP')}</span>
          </p>
        </div>

        {/* Date Picker */}
        <form className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <CalendarDays className="w-5 h-5 text-gray-400" />
          <input type="hidden" name="courseId" value={courseId} />
          <input 
            type="date" 
            name="date" 
            defaultValue={dateStr}
            className="outline-none text-sm text-gray-700 font-medium"
            aria-label="Select Attendance Date" // Added for accessibility
          />
          <button type="submit" className="hidden">Update</button>
        </form>
      </div>

      {/* The error likely happened here if types didn't match. 
         We now pass strictly formatted data. 
      */}
      <AttendanceRegister 
        classId={classId} 
        courseId={courseId} 
        date={dateStr}
        students={students} 
      />
    </div>
  );
}
