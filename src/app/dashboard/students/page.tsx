import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  Plus, 
  Search, 
  GraduationCap,
  FileSpreadsheet
} from 'lucide-react';
import { SchoolType } from '@prisma/client';
import StudentActions from '@/components/students/StudentActions';
//import ExportActions from '@/components/students/ExportActions';

// --- Server Data Fetching ---
async function getStudents(query: string) {
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
      enrollments: {
        where: { academicYear: { contains: '/' } }, // Grab the latest one
        orderBy: { academicYear: 'desc' },
        take: 1,
        include: { class: true }
      },
       user: {
        select: { email: true } // We only need the email
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get Config for conditional rendering (Basic vs Tertiary)
  const config = await prisma.schoolConfig.findFirst();

  return { students, isTertiary: config?.schoolType === SchoolType.TERTIARY };
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
          {/* Export Button (Placeholder) */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
          
          <Link 
            href="/dashboard/students/add" 
            className="flex items-center gap-2 px-5 py-2 bg-emerald-800 text-white rounded-full text-sm font-medium hover:bg-emerald-900 shadow-lg shadow-emerald-900/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            Admit Student
          </Link>
        </div>
      </div>

      {/* --- SEARCH BAR (Server Action Form) --- */}
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

      {/* --- THE LEDGER TABLE --- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {students.length === 0 ? (
          // Empty State
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No students found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
              {query ? `We couldn't find anyone matching "${query}".` : "Get started by admitting your first student into the system."}
            </p>
            {!query && (
               <Link href="/dashboard/students/add" className="text-emerald-700 font-medium hover:underline">
                 Go to Admissions &rarr;
               </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student Identity</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Matric No.</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {isTertiary ? 'Course / Major' : 'Class Level'}
                  </th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const currentClass = student.enrollments[0]?.class?.name || 'Unassigned';
                  
                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/80 transition-colors">
                      {/* Name Column */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-200">
                            {getInitials(student.fullName)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{student.fullName}</p>
                          <p className="text-xs text-slate-500 hidden sm:block">
                            {student.user?.email || 'No email'}
                             </p>
                          </div>
                        </div>
                      </td>

                      {/* Matric Column */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {student.matricNumber || 'PENDING'}
                        </span>
                      </td>

                      {/* Academic Placement */}
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {isTertiary ? (
                          <div>
                            <p className="font-medium text-slate-900">{student.department?.name || 'General'}</p>
                            <p className="text-xs text-slate-500">{student.level?.name}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-slate-900">{currentClass}</p>
                            <p className="text-xs text-slate-500">{student.level?.name}</p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          Active
                        </span>
                      </td>

                      {/* Actions */}
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

      {/* --- PAGINATION (Simple Placeholder) --- */}
      {students.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
          <p>Showing {students.length} students</p>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">Previous</button>
            <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper for Initials (e.g., "Daniel Okafor" -> "DO")
function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
