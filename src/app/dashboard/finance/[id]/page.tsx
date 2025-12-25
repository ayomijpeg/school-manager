import Link from "next/link";
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import RecordPaymentButton from '@/components/finance/RecordPaymentButton';
import PrintButton from '@/components/finance/PrintButton';

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch Data
  const [invoice, config] = await Promise.all([
      prisma.invoice.findUnique({
        where: { id },
        include: { 
            student: { include: { level: true } }, 
            invoiceItems: true, 
            payments: true 
        }
      }),
      prisma.schoolConfig.findFirst()
  ]);

  if (!invoice) notFound();

  const isPaid = invoice.status === 'PAID';
  const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen border-x border-slate-100 shadow-xl my-8 print:shadow-none print:border-none print:my-0">
       <div className="p-4 border-b border-slate-100 print:hidden">
          <Link href="/dashboard/finance" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-800 transition-colors">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Ledger
          </Link>
       </div>
       {/* ACTION BAR */}
       <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex gap-2">
             {/* FIXED: Using Client Component here */}
             <PrintButton />
          </div>
          {!isPaid && (
             <RecordPaymentButton invoiceId={invoice.id} balance={balance} />
          )}
       </div>

       {/* ... Rest of your invoice UI remains exactly the same ... */}
       <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          {/* Header Content */}
          <div>
             <h1 className="text-2xl font-serif font-bold text-slate-900">{config?.schoolName}</h1>
             <p className="text-sm text-slate-500 mt-1">{config?.address || 'School Address'}</p>
             <p className="text-sm text-slate-500">{config?.website}</p>
          </div>
          <div className="text-right">
             <h2 className="text-4xl font-black text-slate-200 uppercase tracking-widest">{isPaid ? 'RECEIPT' : 'INVOICE'}</h2>
             <p className="font-mono text-sm text-slate-600 mt-2">#{invoice.invoiceNumber}</p>
             <p className={`inline-block px-3 py-1 rounded text-xs font-bold mt-2 ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {invoice.status}
             </p>
          </div>
       </div>

       {/* Bill To */}
       <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bill To</p>
             <p className="font-bold text-slate-900 text-lg">{invoice.student.fullName}</p>
             <p className="text-sm text-slate-600">{invoice.student.matricNumber}</p>
             <p className="text-sm text-slate-600">{invoice.student.level?.name}</p>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Dates</p>
             <p className="text-sm text-slate-600"><span className="font-medium">Issued:</span> {formatDate(invoice.issueDate)}</p>
             <p className="text-sm text-slate-600"><span className="font-medium">Due:</span> {formatDate(invoice.dueDate)}</p>
          </div>
       </div>

       {/* Table */}
       <table className="w-full mb-10">
          <thead>
             <tr className="bg-slate-50 text-left">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Description</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {invoice.invoiceItems.map(item => (
                <tr key={item.id}>
                   <td className="py-3 px-4 text-sm text-slate-700">{item.description}</td>
                   <td className="py-3 px-4 text-sm text-slate-900 font-mono text-right">{formatCurrency(Number(item.amount))}</td>
                </tr>
             ))}
          </tbody>
          <tfoot>
             <tr>
                <td className="pt-4 text-right font-bold text-slate-900 pr-4">Total</td>
                <td className="pt-4 text-right font-bold text-slate-900 font-mono pr-4 text-lg">{formatCurrency(Number(invoice.totalAmount))}</td>
             </tr>
             <tr>
                <td className="pt-2 text-right text-sm text-emerald-700 pr-4">Paid</td>
                <td className="pt-2 text-right text-sm text-emerald-700 font-mono pr-4">-{formatCurrency(Number(invoice.amountPaid))}</td>
             </tr>
             <tr className="border-t border-slate-900">
                <td className="pt-4 text-right font-black text-slate-900 pr-4 uppercase">Balance Due</td>
                <td className="pt-4 text-right font-black text-slate-900 font-mono pr-4 text-xl">{formatCurrency(balance)}</td>
             </tr>
          </tfoot>
       </table>

       {/* Bank Details */}
       {!isPaid && config?.bankName && (
           <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2 font-serif">Payment Method</h3>
              <p className="text-sm text-slate-600 mb-4">Please make transfer to the school account below:</p>
              <div className="font-mono text-sm space-y-1">
                 <p><span className="text-slate-400 w-24 inline-block">Bank:</span> {config.bankName}</p>
                 <p><span className="text-slate-400 w-24 inline-block">Account:</span> <span className="font-bold text-slate-900 text-lg">{config.accountNumber}</span></p>
                 <p><span className="text-slate-400 w-24 inline-block">Name:</span> {config.accountName}</p>
              </div>
           </div>
       )}
       
       {/* History */}
       {invoice.payments.length > 0 && (
           <div className="mt-10 pt-6 border-t border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase">Payment History</h3>
               {invoice.payments.map(pay => (
                   <div key={pay.id} className="flex justify-between text-sm text-slate-600 mb-2">
                       <span>{formatDate(pay.paymentDate)} - {pay.paymentMethod || 'Manual'}</span>
                       <span className="font-mono">{formatCurrency(Number(pay.amountPaid))}</span>
                   </div>
               ))}
           </div>
       )}

    </div>
  );
}
