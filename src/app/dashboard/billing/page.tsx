import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Download, History } from 'lucide-react';
import PaymentModal from '@/components/parents/PaymentModal';
import RefreshButton from '@/components/ui/RefreshButton'; // 👈 Import the button

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const parent = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              invoices: {
                include: { payments: true }, 
                orderBy: { issueDate: 'desc' }
              }
            }
          }
        }
      }
    }
  });

  const invoices = parent?.students.flatMap(s => 
    s.student.invoices.map(inv => {
      // Check if there is a pending payment claim
      const hasPendingClaim = inv.payments.some(p => p.status === 'PENDING');
      
      return {
        ...inv,
        studentName: s.student.fullName,
        balance: Number(inv.totalAmount) - Number(inv.amountPaid || 0),
        hasPendingClaim
      };
    })
  ) || [];

  const totalDue = invoices.reduce((acc, inv) => acc + inv.balance, 0);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">Billing & Payments</h1>
             {/* 🟢 The Refresh Button */}
             <RefreshButton /> 
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage school fees and track payment status.</p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₦ {totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {inv.invoiceNumber}
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold dark:text-white">
                    {inv.studentName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-black uppercase w-fit ${
                        inv.status === 'PAID' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                      {inv.hasPendingClaim && (
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                          <History size={10} /> Verification Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black dark:text-white">
                    ₦ {inv.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    
                    {/* DOWNLOAD BUTTON */}
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download Invoice">
                      <Download size={16} />
                    </button>

                    {/* PAYMENT BUTTON (Only if not paid and no pending claim) */}
                    {inv.status !== 'PAID' && !inv.hasPendingClaim && (
                      <PaymentModal 
                        invoiceId={inv.id} 
                        invoiceNumber={inv.invoiceNumber} 
                        amountDue={inv.balance} 
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
