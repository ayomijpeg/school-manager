'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import DeleteInvoiceButton from '@/components/finance/DeleteInvoiceButton';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
            <th className="py-3 px-4 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {initialInvoices.map((inv) => (
            <tr
                key={inv.id}
                onClick={() => openMenuId !== inv.id && router.push(`/dashboard/finance/${inv.id}`)}
                className="group hover:bg-slate-50 cursor-pointer transition-colors relative"
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
              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === inv.id ? null : inv.id); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenuId === inv.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} aria-hidden="true" />
                      <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                        <button
                          type="button"
                          onClick={() => { setOpenMenuId(null); router.push(`/dashboard/finance/${inv.id}`); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          <ExternalLink size={14} /> View invoice
                        </button>
                        <DeleteInvoiceButton invoiceId={inv.id} invoiceNumber={inv.invoiceNumber} variant="menuitem" onDeleted={() => setOpenMenuId(null)} onConfirmOpen={() => setOpenMenuId(null)} />
                      </div>
                    </>
                  )}
                </div>
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
