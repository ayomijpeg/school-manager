import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, FileText, ClipboardCheck } from 'lucide-react';

async function loadTeacher(userId: string) {
  return prisma.teacher.findUnique({
    where: { userId, deletedAt: null },
  });
}

async function loadAssignments(teacherId: string) {
  return prisma.classAssignment.findMany({
    where: { teacherId },
    include: {
      class: { include: { _count: { select: { enrollments: true } } } },
      course: true,
    },
  });
}

export default async function MyClassesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  let teacher: Awaited<ReturnType<typeof loadTeacher>>;
  let assignments: Awaited<ReturnType<typeof loadAssignments>>;

  try {
    teacher = await loadTeacher(user.id);
  } catch (err) {
    console.error('MyClassesPage load error:', err);
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-8 text-center border-2 border-amber-200 bg-amber-50 rounded-xl text-amber-800">
          <h3 className="font-bold">Something went wrong</h3>
          <p className="text-sm mt-1">We couldn’t load your classes. Please try again or contact support.</p>
          <Link href="/dashboard/teachers" className="inline-block mt-4 text-sm font-medium text-amber-700 hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-8 text-center border-2 border-red-100 bg-red-50 rounded-xl text-red-600">
          <h3 className="font-bold">Profile Not Found</h3>
          <p className="text-sm mt-1">This account is not linked to a Teacher profile. Please contact the administrator.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-sm font-medium text-red-700 hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  try {
    assignments = await loadAssignments(teacher.id);
  } catch (err) {
    console.error('MyClassesPage assignments error:', err);
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-8 text-center border-2 border-amber-200 bg-amber-50 rounded-xl text-amber-800">
          <h3 className="font-bold">Something went wrong</h3>
          <p className="text-sm mt-1">We couldn’t load your class list. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-500">Select a class to manage results or attendance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assign) => (
          <div key={assign.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{assign.class.name}</h3>
                <span className="inline-block mt-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                  {assign.course.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                <User size={14} />
                {assign.class._count.enrollments} Students
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              {/* This link points to the Result Entry page */}
              <Link 
                href={`/dashboard/teachers/results/${assign.class.id}?courseId=${assign.course.id}`}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FileText size={16} />
                Results
              </Link>
              
              <Link
                href={`/dashboard/teachers/attendance/${assign.class.id}?courseId=${assign.course.id}`}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <ClipboardCheck size={16} />
                Attendance
              </Link>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500">You have not been assigned to any classes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
