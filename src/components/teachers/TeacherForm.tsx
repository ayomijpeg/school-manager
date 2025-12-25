'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Building2, Pencil } from 'lucide-react';
import Button from '@/components/ui/Button';

// 1. Defined Interfaces
interface Department {
  id: string;
  name: string;
}

interface TeacherData {
  id?: string;
  fullName?: string;
  contactPhone?: string;
  departmentId?: string;
}

interface TeacherFormProps {
  teacher?: TeacherData;
  email?: string;
  departments: Department[];
  onSuccess?: () => void;
  mode?: 'view' | 'edit';
}

export default function TeacherForm({ 
  teacher, 
  email, 
  departments, 
  onSuccess,
  mode = 'edit' 
}: TeacherFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode);
  const isViewOnly = currentMode === 'view';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: teacher?.fullName || '',
    email: email || '',
    contactPhone: teacher?.contactPhone || '',
    departmentId: teacher?.departmentId || '',
  });

  const isNew = !teacher; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    setIsLoading(true);

    try {
      const url = isNew ? '/api/teachers' : `/api/teachers/${teacher?.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      toast.success(isNew ? "Teacher Onboarded" : "Profile Updated");
      router.refresh();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      // Safe Error Handling
      const errMsg = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {isViewOnly && (
        <div className="flex justify-end -mt-2 mb-2">
            <button type="button" onClick={() => setCurrentMode('edit')} className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex gap-1 items-center">
                <Pencil size={14} /> Switch to Edit
            </button>
        </div>
      )}

      {/* Personal Info */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6">
         <h3 className="font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-emerald-700"/> Personal Details
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isNew ? (
              <>
                <Input label="First Name" value={formData.firstName} onChange={(v)=>setFormData({...formData, firstName: v})} />
                <Input label="Last Name" value={formData.lastName} onChange={(v)=>setFormData({...formData, lastName: v})} />
              </>
            ) : (
                <Input label="Full Name" value={formData.fullName} onChange={(v)=>setFormData({...formData, fullName: v})} disabled={isViewOnly} />
            )}
            
            <Input label="Email" type="email" value={formData.email} onChange={(v)=>setFormData({...formData, email: v})} disabled={isViewOnly} />
            <Input label="Phone" type="tel" value={formData.contactPhone} onChange={(v)=>setFormData({...formData, contactPhone: v})} disabled={isViewOnly} />
         </div>
      </div>

      {/* Dept Info */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6">
         <h3 className="font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-700"/> Department
         </h3>
         <div className="grid grid-cols-1 gap-4">
            <Select label="Assign Department" value={formData.departmentId} onChange={(v)=>setFormData({...formData, departmentId: v})} disabled={isViewOnly}>
               <option value="">Select Department...</option>
               {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {isViewOnly ? (
            <Button variant="primary" onClick={onSuccess} type="button" className="bg-slate-800 text-white">Close</Button>
        ) : (
            <>
                <button type="button" onClick={onSuccess} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                <Button variant="primary" isLoading={isLoading} className="bg-emerald-800 text-white">
                   {isNew ? 'Onboard Teacher' : 'Save Changes'}
                </Button>
            </>
        )}
      </div>
    </form>
  );
}

// 2. Helper Components with Proper Types
interface InputProps {
    label: string;
    value: string;
    onChange?: (value: string) => void; // Optional for disabled inputs
    type?: string;
    disabled?: boolean;
}

const Input = ({ label, value, onChange, type="text", disabled }: InputProps) => {
  if (disabled) return (
     <div className="group">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="border-b border-slate-100 pb-1"><p className="text-base font-serif font-medium text-slate-900">{value || '-'}</p></div>
     </div>
  );
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input 
        title="Input Field"
        className="w-full border rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white transition-colors" 
        type={type} 
        value={value} 
        onChange={e => onChange && onChange(e.target.value)} 
      />
    </div>
  );
}

interface SelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
}

const Select = ({ label, value, onChange, children, disabled }: SelectProps) => {
  if (disabled) return ( <Input label={label} value="View Department Logic Needed" disabled={true} /> );
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <select 
        title="Select Department"
        className="w-full border rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white transition-colors" 
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}
