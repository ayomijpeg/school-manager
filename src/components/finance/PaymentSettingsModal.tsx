'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Loader2, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// 1. Define the Prop Type so TypeScript knows what to expect
interface PaymentSettingsModalProps {
  initialConfig?: any; // We accept the config here
}

export default function PaymentSettingsModal({ initialConfig }: PaymentSettingsModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Use initialConfig to fill the form defaults
  const [formData, setFormData] = useState({
    bankName: initialConfig?.bankName || '',
    accountNumber: initialConfig?.accountNumber || '',
    accountName: initialConfig?.accountName || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await fetch('/api/school-config', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error();
        toast.success("Bank details updated");
        router.refresh();
        setIsOpen(false);
    } catch {
        toast.error("Failed to save details");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors" 
        title="Payment Settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}/>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Building2 size={18} /> Bank Settings
                    </h3>
                    <button onClick={() => setIsOpen(false)} aria-label="Close">
                        <X size={18} className="text-slate-400 hover:text-slate-600"/>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Bank Name</label>
                        <input 
                            className="w-full border rounded-lg p-2 mt-1" 
                            placeholder="e.g. GTBank"
                            value={formData.bankName} 
                            onChange={e => setFormData({...formData, bankName: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Account Number</label>
                        <input 
                            className="w-full border rounded-lg p-2 mt-1 font-mono" 
                            placeholder="0123456789"
                            value={formData.accountNumber} 
                            onChange={e => setFormData({...formData, accountNumber: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Account Name</label>
                        <input 
                            className="w-full border rounded-lg p-2 mt-1" 
                            placeholder="e.g. Yosola Schools Ltd"
                            value={formData.accountName} 
                            onChange={e => setFormData({...formData, accountName: e.target.value})} 
                        />
                    </div>

                    <button 
                        disabled={isLoading} 
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 flex justify-center items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>} 
                        Save Details
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
