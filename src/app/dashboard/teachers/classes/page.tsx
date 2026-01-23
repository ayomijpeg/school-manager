import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth'; // ✅ Correct import for your setup
import { cookies } from 'next/headers'; // ✅ access cookies manually
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, FileText, ClipboardCheck } from 'lucide-react';

export default async function MyClassesPage() {
  // 1. Manually check for the token
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // 2. Verify the session
  const payload = token ? await verifyJwt(token) : null;
  
  if (!payload) {
    redirect('/auth/login'); // Redirect if not logged in
  }

  // Get User ID from your token payload (sub or id)
  const userId = (payload.sub || payload.id) as string;

  // 3. Get the Teacher Profile linked to the logged-in User
  const teacher = await prisma.teacher.findUnique({
    where: { userId: userId },
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center border-2 border-red-100 bg-red-50 rounded-xl text-red-600">
        <h3 className="font-bold">Profile Not Found</h3>
        <p className="text-sm mt-1">
            This account is not linked to a Teacher profile. Please contact the administrator.
        </p>
      </div>
    );
  }

  // 4. Fetch Classes Assigned to this Teacher
  const assignments = await prisma.classAssignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: { 
        include: { 
          _count: { select: { enrollments: true } } // Counts students automatically
        } 
      },
      course: true,
    }
  });

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
                href={`/dashboard/teacher/results/${assign.class.id}?courseId=${assign.course.id}`}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FileText size={16} />
                Results
              </Link>
              
              <Link
                href={`/dashboard/teacher/attendance/${assign.class.id}?courseId=${assign.course.id}`}
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
