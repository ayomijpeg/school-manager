import { prisma } from '@/lib/prisma';
import ResultEntryForm from '@/components/teachers/ResultEntryForm'; // <-- The Client Component we built earlier
import { notFound } from 'next/navigation';

export default async function TeacherResultPage({ 
  params, 
  searchParams 
}: { 
  params: { classId: string }, 
  searchParams: { courseId: string } 
}) {
  const { classId } = params;
  const { courseId } = searchParams;

  if (!courseId) return <div className="p-8 text-red-500">Missing Course ID</div>;

  // 1. Fetch Context (Class & Course Name)
  const classInfo = await prisma.class.findUnique({ where: { id: classId } });
  const courseInfo = await prisma.course.findUnique({ where: { id: courseId } });

  if (!classInfo || !courseInfo) return notFound();

  // 2. Fetch Students & Existing Results
  // This query gets the students AND their current score for this specific course
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          results: {
            where: { courseId: courseId } // Filter only this subject's results
          }
        }
      }
    },
    orderBy: { student: { fullName: 'asc' } }
  });

  // 3. Flatten data for the form
  const students = enrollments.map(en => {
    const res = en.student.results[0]; // The specific result for this course (if it exists)
    return {
      studentId: en.student.id,
      studentName: en.student.fullName,
      currentCa: res?.caScore ? Number(res.caScore) : 0,
      currentExam: res?.examScore ? Number(res.examScore) : 0
    };
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Results</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
             <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{classInfo.name}</span>
             <span>•</span>
             <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{courseInfo.name}</span>
          </div>
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
