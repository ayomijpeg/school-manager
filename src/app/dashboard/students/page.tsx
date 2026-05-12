import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { SchoolType } from '@prisma/client';
import StudentActions from '@/components/students/StudentActions';
import ExportButton from '@/components/ui/export';
import ImportActions from '@/components/ui/ImportActions';
import RefreshButton from '@/components/ui/RefreshButton';

// --- Server Data Fetching ---
async function getStudents(query: string) {
  // 1. Get the current config to match the exact year
  const config = await prisma.schoolConfig.findFirst();
  const currentYear = config?.academicYear || '';

  const students = await prisma.student.findMany({
    where: {
      deletedAt: null,
      OR: query ? [
        { fullName: { contains: query, mode: 'insensitive' } },
        { matricNumber: { contains: query, mode: 'insensitive' } },
      ] : undefined,
    },
    include: {
      level: true,
      department: true,
      _count: {
        select: { parents: true }
      },
      // 2. 🟢 FIXED: Removed the contains: '/' filter. 
      // We now fetch the latest enrollment regardless of string format.
      enrollments: {
        orderBy: { academicYear: 'desc' },
        take: 1,
        include: { class: true }
      },
       user: {
        select: { email: true }
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { 
    students, 
    isTertiary: config?.schoolType === SchoolType.TERTIARY,
    currentYear 
  };
}

export default async function StudentListPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>; 
}) {
    const { query } = await searchParams; 
    const searchQuery = query || '';

    const { students, isTertiary } = await getStudents(searchQuery);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 mt-1">
            Manage admissions, academic records, and student profiles.
          </p>
        </div>
        <div className="flex gap-3">
          <RefreshButton />
          <ExportButton />
          <ImportActions />
          <Link 
            href="/dashboard/students/add" 
            className="flex items-center gap-2 px-5 py-2 bg-emerald-800 text-white rounded-full text-sm font-medium hover:bg-emerald-900 shadow-lg shadow-emerald-900/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            Admit Student
          </Link>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-6">
        <form className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            name="query"
            defaultValue={searchQuery}
            placeholder="Search by name or matric number..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
          />
        </form>
      </div>

      {/* --- THE TABLE --- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-20 px-4">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No students found</h3>
            <p className="text-slate-500">Try adjusting your search or admit a new student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 pl-6 text-xs font-bold uppercase text-slate-500">Student Identity</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">Matric No.</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">
                    {isTertiary ? 'Course / Major' : 'Class Assignment'}
                  </th>
                  <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">Guardian</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  // 3. 🟢 GET CLASS NAME SAFELY
                  const currentClass = student.enrollments[0]?.class?.name || 'Unassigned';
                  const isLinked = student._count.parents > 0;
                  
                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-200">
                              {getInitials(student.fullName)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{student.fullName}</p>
                              <p className="text-xs text-slate-500">{student.user?.email || 'No email'}</p>
                            </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {student.matricNumber || 'PENDING'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                           {/* 4. 🟢 SHOW CLASS STATUS WITH BADGE COLOR */}
                           <span className={`text-sm font-bold ${currentClass === 'Unassigned' ? 'text-amber-600' : 'text-slate-900'}`}>
                              {currentClass}
                           </span>
                           <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                             Level: {student.level?.name || 'N/A'}
                           </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isLinked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Linked
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100 uppercase">
                                <AlertCircle className="w-3 h-3" /> No Parent
                            </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                          <StudentActions studentId={student.id} studentName={student.fullName} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}
