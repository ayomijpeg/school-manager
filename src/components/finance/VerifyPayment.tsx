'use client';

import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VerifyPaymentProps {
  paymentId: string;
}

export default function VerifyPayment({ paymentId }: VerifyPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'APPROVE' | 'REJECT' | null>(null);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    // Prevent double clicks
    if (loading) return;

    setLoading(action);
    
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      if (action === 'APPROVE') {
        toast.success('Payment approved! Invoice updated.');
      } else {
        toast.info('Payment claim rejected.');
      }

      // Refresh the page to remove this item from the list
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Operation failed. Try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* REJECT BUTTON */}
      <button 
        onClick={() => handleAction('REJECT')}
        disabled={!!loading}
        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Reject Claim"
      >
        {loading === 'REJECT' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <X size={16} className="group-hover:scale-110 transition-transform" />
        )}
      </button>
      
      {/* APPROVE BUTTON */}
      <button 
        onClick={() => handleAction('APPROVE')}
        disabled={!!loading}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {loading === 'APPROVE' ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Check size={14} />
        )}
        Approve
      </button>
    </div>
  );
}
