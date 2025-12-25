'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, BookOpen, Pencil } from 'lucide-react';
import Button from '@/components/ui/Button';

// Add 'mode' to props
export default function EditStudentForm({ 
  student, 
  email, 
  levels, 
  departments, 
  isTertiary,
  onSuccess,
  mode = 'edit' // Default to 'edit'
}: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state to toggle mode internally if user clicks "Edit" from View mode
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode);
  const isViewOnly = currentMode === 'view';

  const [formData, setFormData] = useState({
    fullName: student.fullName,
    email: email || '',
    contactPhone: student.contactPhone || '',
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
    levelId: student.levelId || '',
    departmentId: student.departmentId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return; // Should not happen, but safe guard

    setIsLoading(true);

    try {
        const res = await fetch(`/api/students/${student.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!res.ok) throw new Error("Update failed");
        
        toast.success("Profile updated");
        router.refresh(); 
        if (onSuccess) onSuccess(); 
    } catch (error) {
        toast.error("Could not save changes");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* If viewing, show an Edit Button at the top */}
      {isViewOnly && (
        <div className="flex justify-end -mt-2 mb-2">
            <button 
                type="button"
                onClick={() => setCurrentMode('edit')}
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors"
            >
                <Pencil className="w-3.5 h-3.5" /> Switch to Edit Mode
            </button>
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 relative">
         <h3 className="font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-emerald-700"/> Personal Details
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={formData.fullName} onChange={(v:string)=>setFormData({...formData, fullName: v})} disabled={isViewOnly} />
            <Input label="Email" type="email" value={formData.email} onChange={(v:string)=>setFormData({...formData, email: v})} disabled={isViewOnly} />
            <Input label="Phone" type="tel" value={formData.contactPhone} onChange={(v:string)=>setFormData({...formData, contactPhone: v})} disabled={isViewOnly} />
            <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v:string)=>setFormData({...formData, dateOfBirth: v})} disabled={isViewOnly} />
         </div>
      </div>

      {/* Academic Info */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6">
         <h3 className="font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-700"/> Academic Placement
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Level" value={formData.levelId} onChange={(v:string)=>setFormData({...formData, levelId: v})} disabled={isViewOnly}>
               {levels.map((l:any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
            {(isTertiary || departments.length > 0) && (
              <Select label="Department" value={formData.departmentId} onChange={(v:string)=>setFormData({...formData, departmentId: v})} disabled={isViewOnly}>
                 <option value="">No Department</option>
                 {departments.map((d:any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            )}
         </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {isViewOnly ? (
            <Button variant="primary" onClick={onSuccess} type="button" className="bg-slate-800 text-white">
                Close
            </Button>
        ) : (
            <>
                <button 
                  type="button"
                  onClick={onSuccess} 
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <Button variant="primary" isLoading={isLoading} className="bg-emerald-800 hover:bg-emerald-900 text-white">
                  Save Changes
                </Button>
            </>
        )}
      </div>
    </form>
  );
}

// Helpers (Now accepting disabled prop)


const Input = ({ label, value, onChange, type = "text", disabled }: any) => {
  // VIEW MODE: Render clean text with a subtle underline (Ledger style)
  if (disabled) {
    return (
      <div className="group">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="border-b border-slate-100 pb-1.5 pt-0.5">
          <p className="text-base font-serif font-medium text-slate-900 leading-none">
            {value || <span className="text-slate-300 italic">Not set</span>}
          </p>
        </div>
      </div>
    );
  }

  // EDIT MODE: Render the input box
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-700"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

const Select = ({ label, value, onChange, children, disabled }: any) => {
  // VIEW MODE: Render text (We cheat slightly by using the select but stripping all styles)
  if (disabled) {
    return (
      <div className="group">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="border-b border-slate-100 pb-1.5 pt-0.5 relative">
          <select
            className="w-full bg-transparent border-none p-0 text-base font-serif font-medium text-slate-900 appearance-none pointer-events-none leading-none"
            value={value}
            disabled
          >
            {/* If value is empty, show placeholder */}
            {!value && <option>—</option>}
            {children}
          </select>
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          className="w-full border border-slate-200 rounded-lg p-2.5 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-700 appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
