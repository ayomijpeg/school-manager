import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  User, Phone, Mail, ArrowLeft, GraduationCap, 
  Pencil, Clock, Receipt, AlertCircle 
} from 'lucide-react';
import { formatDate } from '@/lib/utils'; 

export default async function ViewParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Updated Query: Fetch Students AND their Invoices
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: true,
      students: {
        include: {
          student: {
            include: { 
              level: true, 
              department: true,
              invoices: { // <--- FETCH INVOICES HERE
                orderBy: { issueDate: 'desc' },
                take: 5 
              }
            }
          }
        }
      }
    }
  });

  if (!parent) notFound();

  // 2. Helper: Flatten invoices to show in one list
  const allInvoices = parent.students.flatMap(link => 
    link.student.invoices.map(inv => ({
      ...inv,
      studentName: link.student.fullName,
      studentId: link.student.id
    }))
  ).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      
      {/* TOP NAV */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard/parents" className="flex items-center text-sm font-medium text-slate-500 hover:text-emerald-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Registry
        </Link>
        <Link href={`/dashboard/parents/edit/${parent.id}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Pencil className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-serif font-bold text-slate-600 border border-slate-200">
          {parent.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-serif text-slate-900">{parent.fullName}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                 <Mail className="w-3.5 h-3.5" /> {parent.user?.email || 'No Email'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                 <Phone className="w-3.5 h-3.5" /> {parent.contactPhone || 'No Phone'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                 <Clock className="w-3.5 h-3.5" /> Joined: {formatDate(parent.createdAt)}
              </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* SECTION: WARDS */}
           <section>
             <h2 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2 mb-4">
               <GraduationCap className="w-5 h-5 text-emerald-700" /> Linked Wards
             </h2>

             {parent.students.length === 0 ? (
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center border-dashed">
                  <p className="text-slate-500 text-sm">No students linked to this account.</p>
                  <Link href={`/dashboard/parents/edit/${parent.id}`} className="text-emerald-700 text-xs font-bold uppercase mt-2 inline-block hover:underline">Link a Child</Link>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                  {parent.students.map(({ student }) => (
                    <Link key={student.id} href={`/dashboard/students/${student.id}`} className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
                              {student.fullName.substring(0,2).toUpperCase()}
                           </div>
                           <div>
                              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                {student.fullName}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                {student.matricNumber}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200">
                              {student.level?.name || student.department?.name || 'Unassigned'}
                           </span>
                        </div>
                    </Link>
                  ))}
               </div>
             )}
           </section>

           {/* SECTION: FINANCIAL HISTORY (NEW) */}
           <section>
             <h2 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2 mb-4">
               <Receipt className="w-5 h-5 text-emerald-700" /> Invoice History
             </h2>

             <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {allInvoices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No invoices generated for these students yet.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Invoice #</th>
                                <th className="px-6 py-3 font-semibold">Ward</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono text-xs">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{inv.studentName}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        ₦{Number(inv.totalAmount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            inv.status === 'PAID' ? 'bg-green-50 text-green-700 border border-green-100' : 
                                            inv.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                            'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">
                                        {formatDate(inv.issueDate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
             </div>
           </section>

        </div>

        {/* RIGHT COLUMN: STATUS */}
        <div className="space-y-6">
           <h2 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2">
             <User className="w-5 h-5 text-indigo-700" /> Account Status
           </h2>
           
           <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                 <p className="font-medium text-slate-900">Guardian / Parent</p>
              </div>
              <div className="h-px bg-slate-100" />
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Portal Access</p>
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                 </span>
              </div>
              
              {/* Alert Logic based on Unpaid Invoices */}
              {allInvoices.some(i => i.status === 'PENDING' || i.status === 'OVERDUE') && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div>
                          <p className="text-xs font-bold text-red-700">Action Required</p>
                          <p className="text-xs text-red-600 mt-0.5">There are pending invoices on this account.</p>
                      </div>
                  </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
