'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteInvoiceButtonProps {
  invoiceId: string;
  invoiceNumber?: string;
  variant?: 'button' | 'menuitem';
  onDeleted?: () => void;
  onConfirmOpen?: () => void;
}

export default function DeleteInvoiceButton({
  invoiceId,
  invoiceNumber,
  variant = 'button',
  onDeleted,
  onConfirmOpen,
}: DeleteInvoiceButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/finance/invoices/${invoiceId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      toast.success(invoiceNumber ? `Invoice ${invoiceNumber} voided.` : 'Invoice deleted.');
      onDeleted?.();
      router.push('/dashboard/finance');
      setTimeout(() => router.refresh(), 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete invoice.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (variant === 'menuitem') {
    return (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onConfirmOpen?.();
            setShowConfirm(true);
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={14} /> Void / Delete
        </button>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50" onClick={() => setShowConfirm(false)}>
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <p className="text-slate-700 font-medium mb-2">Void this invoice?</p>
              <p className="text-sm text-slate-500 mb-4">This cannot be undone. The invoice will be removed from the ledger.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  {isDeleting && <Loader2 size={14} className="animate-spin" />} Void invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
      >
        <Trash2 size={16} /> Void / Delete invoice
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-slate-700 font-medium mb-2">Void this invoice?</p>
            <p className="text-sm text-slate-500 mb-4">This cannot be undone. The invoice will be removed from the ledger.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                {isDeleting && <Loader2 size={14} className="animate-spin" />} Void invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
