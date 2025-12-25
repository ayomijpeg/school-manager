import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AlertCircle, ArrowLeft, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import VerifyPayment from '@/components/finance/VerifyPayment';
import RefreshButton from '@/components/ui/RefreshButton'; // <--- Import it

export default async function PaymentVerificationPage() {
  const pendingPayments = await prisma.payment.findMany({
    where: { status: 'PENDING' },
    include: {
      invoice: {
        include: {
          student: { include: { level: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[#FDFDFC]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/dashboard/admin/finance" 
              className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft size={12} /> Back to Ledger
            </Link>
          </div>
          <h1 className="text-3xl font-serif text-slate-900 tracking-tight">Payment Verification</h1>
          <p className="text-slate-500 mt-1">Review and approve payment claims submitted by parents.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* THE NEW REFRESH BUTTON */}
          <RefreshButton /> 

          <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100 flex items-center gap-2 shadow-sm">
            <AlertCircle size={16} />
            {pendingPayments.length} Pending Claim{pendingPayments.length !== 1 && 's'}
          </div>
        </div>
      </div>

      {/* TABLE CONTENT ... (Rest of your code remains the same) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {/* ... table code ... */}
        <table className="w-full text-left border-collapse">
          {/* ... */}
            <tbody className="divide-y divide-slate-100">
            {pendingPayments.map((pay) => (
              <tr key={pay.id} className="group hover:bg-slate-50/50 transition-colors">
                 {/* ... table rows ... */}
                 <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700">
                            {new Date(pay.paymentDate).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                            Logged: {new Date(pay.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {pay.invoice.student.fullName.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{pay.invoice.student.fullName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {pay.invoice.student.level?.name || 'N/A'}
                            </span>
                            <span>#{pay.invoice.invoiceNumber}</span>
                        </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-start gap-2">
                    <CreditCard size={14} className="mt-0.5 text-slate-400" />
                    <div>
                        <p className="text-xs font-bold text-slate-700 break-all">
                            {pay.reference || 'No Ref Provided'}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">
                            {pay.paymentMethod || 'Unknown Method'}
                        </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    ₦ {Number(pay.amountPaid).toLocaleString()}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <VerifyPayment paymentId={pay.id} />
                </td>
              </tr>
            ))}
            {/* Empty State */}
            {pendingPayments.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">All Caught Up!</h3>
                        <p className="text-slate-500 text-sm">There are no pending payment claims to verify at this moment.</p>
                    </div>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
