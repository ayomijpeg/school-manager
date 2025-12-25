'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function RecordPaymentButton({ invoiceId, balance }: { invoiceId: string, balance: number }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [amount, setAmount] = useState(balance.toString());
  const [method, setMethod] = useState('Bank Transfer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > balance) {
        if(!confirm("Amount exceeds balance. Continue anyway?")) return;
    }

    setIsLoading(true);
    try {
        const res = await fetch(`/api/finance/invoices/${invoiceId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ amount, method, date })
        });

        if(!res.ok) throw new Error("Failed");
        
        toast.success("Payment Recorded");
        setIsOpen(false);
        router.refresh();
    } catch(err) { // Changed 'e' to 'err' or used console
        toast.error("Failed to record payment");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-lg text-sm font-medium hover:bg-emerald-900"
      >
        <CreditCard size={16} /> Record Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}/>
            <div className="relative bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Record Payment</h3>
                    {/* FIXED: Accessibility */}
                    <button onClick={() => setIsOpen(false)} aria-label="Close">
                        <X size={18} className="text-slate-400"/>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="pay-amount" className="text-xs font-bold text-slate-500 uppercase">Amount Received</label>
                        <input 
                            id="pay-amount"
                            type="number" 
                            required 
                            className="w-full border rounded-lg p-2 mt-1" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                        />
                        <p className="text-xs text-slate-400 mt-1">Balance Due: {formatCurrency(balance)}</p>
                    </div>

                    <div>
                        <label htmlFor="pay-method" className="text-xs font-bold text-slate-500 uppercase">Payment Method</label>
                        <select 
                            id="pay-method"
                            className="w-full border rounded-lg p-2 mt-1 bg-white"
                            value={method} 
                            onChange={e => setMethod(e.target.value)}
                        >
                            <option>Bank Transfer</option>
                            <option>Cash</option>
                            <option>POS / Card</option>
                            <option>Cheque</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="pay-date" className="text-xs font-bold text-slate-500 uppercase">Date</label>
                        <input 
                            id="pay-date"
                            type="date" 
                            required 
                            className="w-full border rounded-lg p-2 mt-1" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                        />
                    </div>

                    <button disabled={isLoading} className="w-full bg-emerald-800 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-emerald-900">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                        Confirm Payment
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
