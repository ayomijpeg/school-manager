import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Search, Mail, Phone, GraduationCap } from 'lucide-react';
import AddTeacherButton from '@/components/teachers/AddTeacherButton'; // We'll make this
import TeacherActions from '@/components/teachers/TeacherActions';     // We'll make this

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

export default async function TeacherListPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams;
  const teachers = await getTeachers(query || '');

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-slate-900">Staff Directory</h1>
          <p className="text-slate-500 mt-1">Manage teaching staff and department assignments.</p>
        </div>
        <AddTeacherButton /> 
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {teachers.length === 0 ? (
           <div className="text-center py-20">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><GraduationCap className="text-slate-400" /></div>
             <p className="text-slate-500">No teachers found.</p>
           </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-4 pl-6 text-xs font-bold uppercase text-slate-500">Staff Name</th>
                <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">Department</th>
                <th className="py-4 px-4 text-xs font-bold uppercase text-slate-500">Contact</th>
                <th className="py-4 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {t.fullName.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{t.fullName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
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
                    <TeacherActions teacherId={t.id} teacherName={t.fullName} />
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
