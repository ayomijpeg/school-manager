import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  Receipt,
  FileText,
  User,
  Mail,
  BookOpen,
  Calendar,
  IdCard,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { buildFeeReminderMessage, buildGeneralMessage } from '@/lib/whatsapp';
import { ShieldCheck, Phone } from 'lucide-react';
import StudentPhotoUpload from '@/components/students/StudentPhotoUpload';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const { id } = await params;

  const [student, config] = await Promise.all([
    prisma.student.findUnique({
      where: { id, deletedAt: null },
      include: {
        level: true,
        department: true,
        user: { select: { email: true } },
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
        parents: { 
          include: { 
            parent: { 
              select: { id: true, fullName: true, contactPhone: true } 
            } 
          } 
        },
      },
    }),
    prisma.schoolConfig.findFirst()
  ]);

  if (!student) notFound();

  // Parents may only view their linked wards
  if (user.role === 'PARENT') {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: { students: { where: { studentId: id }, select: { studentId: true } } },
    });
    const isLinked = parent?.students.some((s) => s.studentId === id);
    if (!isLinked) redirect('/dashboard');
  } else if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  const pendingBalance = student.invoices.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)),
    0
  );

  const primaryParent = student.parents[0]?.parent;
  const parentPhone = primaryParent?.contactPhone || student.contactPhone;

  const feeReminderMessage = buildFeeReminderMessage({
    parentName: primaryParent?.fullName,
    studentName: student.fullName,
    className: student.level?.name,
    amountDue: pendingBalance,
    term: config?.currentTerm,
    schoolName: config?.schoolName,
    bankName: config?.bankName,
    accountNumber: config?.accountNumber,
    accountName: config?.accountName,
  });

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
        </Link>
        {user.role === 'ADMIN' && (
          <Link
            href="/dashboard/students"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50"
          >
            View in list (edit from there)
          </Link>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl font-serif font-bold text-emerald-800 border-2 border-emerald-600/30 overflow-hidden relative shrink-0 shadow-inner">
            {student.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={student.photoUrl}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              student.fullName.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">{student.fullName}</h1>
                {student.matricNumber && (
                  <p className="text-sm font-mono text-slate-500 mt-0.5">{student.matricNumber}</p>
                )}
              </div>
              {user.role === 'ADMIN' && (
                <StudentPhotoUpload
                  studentId={student.id}
                  studentName={student.fullName}
                  currentPhoto={student.photoUrl}
                  variant="button"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {student.level && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-sm text-slate-600">
                  <BookOpen className="w-3.5 h-3.5" /> {student.level.name}
                </span>
              )}
              {student.department && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-sm text-slate-600">
                  {student.department.name}
                </span>
              )}
              {student.user?.email && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-sm text-slate-600">
                  <Mail className="w-3.5 h-3.5" /> {student.user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Outstanding balance</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(pendingBalance)}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Invoices</p>
            <p className="text-xl font-bold text-slate-900">{student.invoices.length} recent</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Link
          href={user.role === 'ADMIN' ? `/dashboard/finance?query=${encodeURIComponent(student.fullName)}` : '/dashboard/billing'}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-medium hover:bg-emerald-900 shadow-sm"
        >
          <Receipt className="w-4 h-4" /> View all invoices
        </Link>
        <Link
          href="/dashboard/results"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm"
        >
          <FileText className="w-4 h-4" /> Report card
        </Link>
        <Link
          href={`/dashboard/students/id-cards?studentId=${student.id}&autoPrint=true`}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-xl text-sm font-medium hover:bg-emerald-100 shadow-sm transition-colors"
          title="Print official student ID card"
        >
          <IdCard className="w-4 h-4 text-emerald-700" /> Print ID Card
        </Link>
        {user.role === 'ADMIN' && pendingBalance > 0 && (
          <WhatsAppButton
            phone={parentPhone}
            message={feeReminderMessage}
            label="Send WhatsApp Fee Reminder"
          />
        )}
      </div>

      {/* Recent invoices */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 border-b border-slate-100 font-serif font-bold text-slate-800 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-700" /> Recent invoices
        </h2>
        {student.invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No invoices yet. Create one from the Finance Ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Invoice #</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Due</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(Number(inv.totalAmount))}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : inv.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' && (
                        <Link
                          href={`/dashboard/finance/${inv.id}`}
                          className="text-emerald-700 text-xs font-medium hover:underline"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Authorized Dismissal & Pickup Contacts */}
      <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Authorized Dismissal & Pickup Contacts
          </h2>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            Pupil Safety Record
          </span>
        </div>

        {student.parents.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No parent/guardian linked yet. Link a parent from the Parents directory.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {student.parents.map(({ parent }) => {
              const chatMsg = `Hello Mr/Mrs ${parent.fullName}, this is from Yosola Schools regarding your ward ${student.fullName}.`;
              return (
                <div key={parent.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/dashboard/parents/${parent.id}`}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-sm block"
                    >
                      {parent.fullName}
                    </Link>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {parent.contactPhone || 'No phone recorded'}
                    </span>
                  </div>
                  {parent.contactPhone && (
                    <WhatsAppButton
                      phone={parent.contactPhone}
                      message={chatMsg}
                      variant="secondary"
                      label="Chat"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
