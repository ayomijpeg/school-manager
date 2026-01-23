import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';
import Link from 'next/link';
import { ClipboardCheck, ChevronRight, User } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AttendanceHubPage() {
  // 1. Auth Check (Fixed Router Error)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    redirect('/auth/login');
  }
  
  const userId = (payload.sub || payload.id) as string;

  // 2. Fetch Teacher Profile
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
  });

  if (!teacher) return <div className="p-8">Teacher profile not found.</div>;

  // 3. Fetch Assigned Classes
  const assignments = await prisma.classAssignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: { include: { _count: { select: { enrollments: true } } } },
      course: true,
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500">Select a class below to take attendance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((assign) => (
          <Link 
            key={assign.id} 
            href={`/dashboard/teachers/attendance/${assign.class.id}?courseId=${assign.course.id}`}
            className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {assign.class.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {assign.course.name}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {assign.class._count.enrollments} Students
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
              </div>
            </div>
          </Link>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <ClipboardCheck className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-900">No Classes Found</h3>
            {/* ✅ Fixed unescaped quote */}
            <p className="text-sm text-gray-500 mt-1">You haven&apos;t been assigned to any subjects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
