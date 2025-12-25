import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Users, MoreHorizontal } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination'; // Ensure this exists
import ParentActions from '@/components/parents/ParentActions'; // Ensure this exists

const ITEMS_PER_PAGE = 10;

// Type Definition for Wards to avoid 'any'
type LinkedStudent = {
  studentId: string;
  student: {
    id: string;
    fullName: string;
    level?: { name: string } | null;
  };
};

// --- Server Data Fetching ---
async function getParents(query: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const whereCondition = {
    deletedAt: null,
    OR: query ? [
      { fullName: { contains: query, mode: 'insensitive' as const } },
      { contactPhone: { contains: query, mode: 'insensitive' as const } },
      { students: { some: { student: { fullName: { contains: query, mode: 'insensitive' as const } } } } }
    ] : undefined
  };

  const [parents, totalCount] = await prisma.$transaction([
    prisma.parent.findMany({
      where: whereCondition,
      skip: skip,
      take: ITEMS_PER_PAGE,
      include: {
        user: { select: { email: true } },
        students: {
          include: {
            student: { select: { id: true, fullName: true, matricNumber: true, level: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.parent.count({ where: whereCondition })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  return { parents, totalPages };
}

export default async function ParentListPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.query || '';
  const currentPage = Number(params.page) || 1;

  const { parents, totalPages } = await getParents(query, currentPage);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Parent Registry</h1>
          <p className="text-slate-500 mt-1">Manage guardian accounts and student linkages.</p>
        </div>
        <Link 
          href="/dashboard/parents/add" 
          className="flex items-center gap-2 px-5 py-2 bg-emerald-800 text-white rounded-full text-sm font-medium hover:bg-emerald-900 shadow-lg shadow-emerald-900/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Register Parent
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <form className="relative max-w-md">
           <input 
             name="query"
             defaultValue={query}
             placeholder="Search parent or child name..."
             className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm"
           />
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {parents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
               <Users className="w-8 h-8" />
             </div>
             <p className="text-slate-500">No parents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500">Parent Name</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Wards</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.map((parent) => (
                  <tr key={parent.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold font-serif border border-slate-200">
                          {parent.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <Link href={`/dashboard/parents/${parent.id}`} className="font-medium text-slate-900 hover:text-emerald-700 hover:underline">
                            {parent.fullName}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{parent.contactPhone || '-'}</span>
                        <span className="text-xs text-slate-400">{parent.user?.email || 'No Email'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <WardsCell students={parent.students} />
                    </td>
                    <td className="py-4 px-4 text-right">
                       <ParentActions parentId={parent.id} parentName={parent.fullName} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t border-slate-50">
            <TablePagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENT: WARDS CELL ---
function WardsCell({ students }: { students: LinkedStudent[] }) {
    if (!students || students.length === 0) {
        return <span className="text-xs text-slate-400 italic">No wards linked</span>;
    }

    const display = students.slice(0, 2);
    const remaining = students.length - 2;

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2 max-w-[200px]">
                {display.map((link) => (
                    <div key={link.studentId} className="flex flex-col">
                        <span className="inline-flex px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100 whitespace-nowrap">
                            {link.student.fullName.split(' ')[0]} 
                        </span>
                    </div>
                ))}
            </div>
            
            {remaining > 0 && (
                <div 
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200 cursor-help"
                    title={`+ ${students.slice(2).map((s) => s.student.fullName).join(', ')}`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
