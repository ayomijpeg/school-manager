'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

// Define Prop Type
interface InvoiceGeneratorProps {
    levels: { id: string; name: string }[];
}

export default function InvoiceGenerator({ levels }: InvoiceGeneratorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [targetType, setTargetType] = useState('CLASS'); 
  const [targetId, setTargetId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ description: '', amount: '' }]);

  const addItem = () => setItems([...items, { description: '', amount: '' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, field: 'description' | 'amount', val: string) => {
      const newItems = [...items];
      // Safely update the field
      newItems[idx] = { ...newItems[idx], [field]: val };
      setItems(newItems);
  };

  const handleSubmit = async () => {
      if(!dueDate) return toast.error("Please select a Due Date");
      if(targetType === 'CLASS' && !targetId) {
          return toast.error("Please select a Level");
      }
      
      setIsLoading(true);
      try {
        const res = await fetch('/api/finance/invoices/bulk', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                targetType,
                targetId: targetType === 'ALL' ? undefined : targetId,
                dueDate,
                items
            })
        });
        
        if(!res.ok) throw new Error("Failed");
        const data = await res.json();
        
        toast.success(`Generated ${data.count} invoices successfully!`);
        setIsOpen(false);
        router.refresh();
      } catch(e) {
        // Log error to console for debugging, but toast for user
        console.error(e);
        toast.error("Generation failed.");
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-full text-sm font-medium hover:bg-emerald-900 shadow-lg shadow-emerald-900/20">
         <Plus className="w-4 h-4" /> Create Invoice
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}/>
           <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h2 className="font-serif font-bold text-lg text-slate-800">Generate Bulk Invoices</h2>
                 {/* FIXED: Added aria-label */}
                 <button onClick={() => setIsOpen(false)} aria-label="Close Modal">
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600"/>
                 </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="target-type" className="text-xs font-bold text-slate-500 uppercase">Bill To</label>
                        <select 
                           id="target-type"
                           className="w-full border rounded-lg p-2.5 bg-slate-50 mt-1" 
                           value={targetType} onChange={e => setTargetType(e.target.value)}
                        >
                           <option value="CLASS">Entire Level/Class</option>
                           <option value="ALL">Whole School</option>
                        </select>
                    </div>
                    {targetType === 'CLASS' && (
                        <div>
                            <label htmlFor="target-id" className="text-xs font-bold text-slate-500 uppercase">Select Level</label>
                            <select 
                               id="target-id"
                               className="w-full border rounded-lg p-2.5 bg-slate-50 mt-1" 
                               value={targetId} onChange={e => setTargetId(e.target.value)}
                            >
                               <option value="">Select...</option>
                               {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    )}
                 </div>

                 <div>
                    <label htmlFor="due-date" className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                    <input 
                       id="due-date"
                       type="date" 
                       className="w-full border rounded-lg p-2.5 bg-slate-50 mt-1"
                       value={dueDate} onChange={e => setDueDate(e.target.value)} 
                    />
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Invoice Items</span>
                        <button onClick={addItem} className="text-xs text-emerald-700 font-bold hover:underline">+ Add Item</button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-3">
                                {/* FIXED: Added aria-labels for inputs */}
                                <input 
                                   aria-label={`Item ${idx + 1} description`}
                                   placeholder="Description (e.g. Tuition)" 
                                   className="flex-1 border rounded-lg p-2 text-sm"
                                   value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} 
                                />
                                <input 
                                   aria-label={`Item ${idx + 1} amount`}
                                   placeholder="Amount" 
                                   type="number" 
                                   className="w-32 border rounded-lg p-2 text-sm"
                                   value={item.amount} onChange={e => updateItem(idx, 'amount', e.target.value)} 
                                />
                                {items.length > 1 && (
                                    <button 
                                      onClick={() => removeItem(idx)} 
                                      className="text-red-400 hover:text-red-600"
                                      aria-label="Remove item"
                                    >
                                       <Trash2 size={16}/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 text-right text-sm font-bold text-slate-900">
                        Total: ₦{items.reduce((s, i) => s + Number(i.amount), 0).toLocaleString()}
                    </div>
                 </div>

              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end">
                 <button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="bg-emerald-800 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-900 transition-colors flex items-center gap-2"
                 >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                    Generate Invoices
                 </button>
              </div>

           </div>
        </div>
      )}
    </>
  );
}
