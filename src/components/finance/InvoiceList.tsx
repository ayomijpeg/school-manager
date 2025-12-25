'use client';

import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react'; // Removed FileText

// Define a minimal type for the invoice data we use
interface InvoiceListItem {
    id: string;
    invoiceNumber: string;
    totalAmount: number | string;
    status: string;
    dueDate: Date | string;
    student: {
        fullName: string;
        level?: { name: string } | null;
    };
}

export default function InvoiceList({ initialInvoices }: { initialInvoices: InvoiceListItem[] }) {
  const router = useRouter();

  if (initialInvoices.length === 0) {
    return (
        <div className="p-12 text-center text-slate-500 text-sm">
            No invoices found. Generate one to get started.
        </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/30">
            <th className="py-3 pl-6 pr-4 text-xs font-bold uppercase text-slate-500">Invoice #</th>
            <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">Student</th>
            <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">Amount</th>
            <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">Status</th>
            <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500">Due Date</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {initialInvoices.map((inv) => (
            <tr 
                key={inv.id} 
                onClick={() => router.push(`/dashboard/finance/${inv.id}`)}
                className="group hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="py-3 pl-6 pr-4 font-mono text-xs text-slate-600">
                {inv.invoiceNumber}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-slate-900">
                {inv.student.fullName}
                <span className="block text-xs text-slate-400 font-normal">{inv.student.level?.name || 'Unassigned'}</span>
              </td>
              <td className="py-3 px-4 text-sm font-mono text-slate-700">
                {formatCurrency(Number(inv.totalAmount))}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={inv.status} />
              </td>
              <td className="py-3 px-4 text-xs text-slate-500">
                {formatDate(inv.dueDate)}
              </td>
              <td className="py-3 px-4 text-right">
                 <MoreHorizontal className="w-4 h-4 text-slate-300 group-hover:text-emerald-600" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Fixed Types for Badge
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
        OVERDUE: 'bg-red-50 text-red-700 border-red-100',
        PARTIALLY_PAID: 'bg-blue-50 text-blue-700 border-blue-100'
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
