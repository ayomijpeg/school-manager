import { prisma } from '@/lib/prisma';
import ResultEntryForm from '@/components/teachers/ResultEntryForm';
import { notFound } from 'next/navigation';
import { AlertCircle, Users } from 'lucide-react';

export default async function TeacherResultPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ classId: string }>, 
  searchParams: Promise<{ courseId: string }> 
}) {
  // 1. Await parameters (Required for Next.js 15+)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const classId = resolvedParams.classId;
  const courseId = resolvedSearchParams.courseId;

  if (!courseId) {
    return (
      <div className="p-8 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg m-6">
        <AlertCircle size={20} />
        <span className="font-bold">Error: Missing Course ID in URL</span>
      </div>
    );
  }

  // 2. Fetch Class and Course Info
  const [classInfo, courseInfo] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.course.findUnique({ where: { id: courseId } })
  ]);

  if (!classInfo || !courseInfo) return notFound();

  // 3. Fetch Students enrolled in this class
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          results: {
            where: { courseId: courseId } 
          }
        }
      }
    },
    orderBy: { student: { fullName: 'asc' } }
  });

  // 4. Transform data for the form
  const students = enrollments.map(en => {
    const res = en.student.results[0]; 
    return {
      studentId: en.student.id,
      studentName: en.student.fullName,
      // Handle potential nulls or decimal types from DB
      currentCa: res?.caScore ? Number(res.caScore) : 0,
      currentExam: res?.examScore ? Number(res.examScore) : 0
    };
  });

  // 5. Check if class is empty
  if (students.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center flex flex-col items-center">
          <Users className="w-12 h-12 text-amber-400 mb-4" />
          <h2 className="text-xl font-bold text-amber-900">No Students Found</h2>
          <p className="text-amber-700 mt-2 max-w-md">
            There are currently no students enrolled in <strong>{classInfo.name}</strong>. 
            You must enroll students before you can upload results for <strong>{courseInfo.name}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-serif">Upload Results</h1>
          <div className="flex items-center gap-2 mt-3">
             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
               {classInfo.name}
             </span>
             <span className="text-gray-300">•</span>
             <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
               {courseInfo.name}
             </span>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Total Students</p>
           <p className="text-2xl font-bold text-gray-700">{students.length}</p>
        </div>
      </div>

      {/* The Form Component */}
      <ResultEntryForm 
        classId={classId} 
        courseId={courseId} 
        students={students} 
      />
    </div>
  );
}
