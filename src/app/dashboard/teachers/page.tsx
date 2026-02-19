import { prisma } from '@/lib/prisma';
import { GraduationCap, Mail, Phone } from 'lucide-react';
import AddTeacherButton from '@/components/teachers/AddTeacherButton';
import TeacherActions from '@/components/teachers/TeacherActions';
import RefreshButton from '@/components/ui/RefreshButton'; 

// Fetch Teachers
async function getTeachers(query: string) {
  return await prisma.teacher.findMany({
    where: {
      deletedAt: null,
      OR: query ? [{ fullName: { contains: query, mode: 'insensitive' } }] : undefined,
    },
    include: {
      department: true,
      user: { select: { email: true } },
    },
    orderBy: { fullName: 'asc' },
  });
}

// Fetch Metadata (Dropdown options)
async function getMetadata() {
  const [classes, courses, departments, levels] = await Promise.all([
    prisma.class.findMany({ select: { id: true, name: true, levelId: true }, orderBy: { name: 'asc' } }),
    prisma.course.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    // ✅ CRITICAL: Ensure levels are fetched here
    prisma.level.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ]);
  
  // Safe return ensuring arrays exist
  return { 
    classes: classes || [], 
    courses: courses || [], 
    departments: departments || [], 
    levels: levels || [] 
  };
}

export default async function TeacherListPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams;
  
  // Parallel Fetching
  const [teachers, metadata] = await Promise.all([
    getTeachers(query || ''),
    getMetadata()
  ]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-100">Staff Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage teaching staff and department assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <AddTeacherButton departments={metadata.departments} />
        </div> 
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {teachers.length === 0 ? (
           <div className="text-center py-20 px-4">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><GraduationCap className="w-8 h-8 text-slate-400 dark:text-slate-500" /></div>
             <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No teachers found</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
               {query ? `No staff match "${query}".` : 'Add your first teacher using the button above.'}
             </p>
           </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-4 pl-6 text-xs font-bold uppercase text-slate-500">Staff Name</th>
                <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">Department</th>
                <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">Contact</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-sm">
                        {t.fullName.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{t.fullName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {t.department?.name || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col text-xs text-slate-500 gap-1">
                      <div className="flex items-center gap-1.5"><Mail size={12}/> {t.user?.email}</div>
                      {t.contactPhone && <div className="flex items-center gap-1.5"><Phone size={12}/> {t.contactPhone}</div>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {/* ✅ Pass ALL props including levels */}
                    <TeacherActions 
                      teacher={t} 
                      classes={metadata.classes}
                      courses={metadata.courses}
                      departments={metadata.departments}
                      levels={metadata.levels} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
