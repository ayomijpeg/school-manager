'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Search, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { studentApi } from '@/lib/api';
import { debounce } from '@/lib/utils';

// --- TYPES (Fixes 'any' errors) ---
interface Student {
  id: string;
  fullName: string;
  matricNumber: string;
}

interface ParentData {
  id?: string;
  fullName?: string;
  contactPhone?: string;
  user?: { email: string };
  students?: { studentId: string; student: Student }[];
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function EditParentForm({ initialData }: { initialData?: ParentData | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Detect Mode
  const isEditMode = !!initialData?.id;

  // Safe Initialization
  const rawName = initialData?.fullName || '';
  const nameParts = rawName.split(' ');
  const defaultLastName = nameParts[0] || '';
  const defaultFirstName = nameParts.slice(1).join(' ') || '';

  const initialIds = initialData?.students?.map((s) => s.studentId) || [];
  const initialObjects = initialData?.students?.map((s) => s.student) || [];

  const [formData, setFormData] = useState({
    firstName: defaultFirstName, 
    lastName: defaultLastName, 
    email: initialData?.user?.email || '', 
    contactPhone: initialData?.contactPhone || '',
    studentIds: initialIds
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(initialObjects);
  const [isSearching, setIsSearching] = useState(false);

  // --- SEARCH LOGIC (UX Improved) ---
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { 
        setSearchResults([]); 
        return; 
      }
      try {
        setIsSearching(true);
        const res = await studentApi.getAll(q);
        setSearchResults(res);
      } catch {
        // Silent error
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    performSearch(e.target.value);
  }

  const addStudent = (student: Student) => {
    if (formData.studentIds.includes(student.id)) return;
    setFormData(prev => ({ ...prev, studentIds: [...prev.studentIds, student.id] }));
    setSelectedStudents(prev => [...prev, student]);
    setSearchQuery(''); 
    setSearchResults([]);
  };

  const removeStudent = (id: string) => {
    setFormData(prev => ({ ...prev, studentIds: prev.studentIds.filter(sid => sid !== id) }));
    setSelectedStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
        toast.error("First Name and Last Name are required");
        return;
    }

    setIsLoading(true);
    
    try {
        const url = isEditMode ? `/api/parents/${initialData?.id}` : `/api/parents`;
        const method = isEditMode ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method: method,
            body: JSON.stringify(formData),
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await res.json();

        if(!res.ok) throw new Error(data.error || "Operation Failed");
        
        toast.success(isEditMode ? "Profile Updated" : "Parent Registered Successfully");
        router.push('/dashboard/parents');
        router.refresh();
    } catch(err: unknown) { // Fix 'any' error
        const message = err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* PARENT INFO CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
             <User size={18}/> Guardian Info
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" value={formData.firstName} onChange={(v) => setFormData({...formData, firstName: v})} />
              <Input label="Last Name" value={formData.lastName} onChange={(v) => setFormData({...formData, lastName: v})} />
              <Input label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
              <Input label="Phone" value={formData.contactPhone} onChange={(v) => setFormData({...formData, contactPhone: v})} />
           </div>
        </div>

        {/* CHILD LINKING CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-visible">
           <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
             <Search size={18}/> Manage Wards
           </h2>
           
           <div className="relative mb-4">
             <div className="relative">
                <input 
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-10 focus:border-emerald-500 outline-none transition-colors" 
                  placeholder="Search student by name..." 
                  value={searchQuery} 
                  onChange={handleSearch} 
                />
                {isSearching && (
                    <div className="absolute right-3 top-3.5 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                )}
             </div>
             
             {/* 🟢 IMPROVED DROPDOWN UX */}
             {searchQuery.length > 1 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        searchResults.map(s => (
                            <button 
                              type="button" 
                              key={s.id} 
                              onClick={() => addStudent(s)} 
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex justify-between items-center group"
                            >
                                <span className="font-medium text-slate-700 group-hover:text-emerald-700">{s.fullName}</span>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{s.matricNumber}</span>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center text-slate-500">
                            <p className="text-sm font-medium">No students found.</p>
                            <p className="text-xs text-slate-400 mt-1">Try searching for a different name.</p>
                        </div>
                    )}
                </div>
             )}
           </div>

           {/* Selected Students Pills */}
           <div className="flex flex-wrap gap-2">
              {selectedStudents.length === 0 && (
                <p className="text-sm text-slate-400 italic">No students linked yet.</p>
              )}
              {selectedStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                      <span>{s.fullName}</span>
                      <button 
                        type="button" 
                        onClick={() => removeStudent(s.id)}
                        aria-label={`Remove ${s.fullName}`} 
                        className="hover:text-emerald-950 transition-colors"
                      >
                        <X size={14}/>
                      </button>
                  </div>
              ))}
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
             <Button variant="ghost" onClick={() => router.back()} type="button">Cancel</Button>
             <Button variant="primary" isLoading={isLoading}>
                {isEditMode ? "Save Changes" : "Register Parent"}
             </Button>
        </div>
    </form>
  );
}

const Input = ({ label, value, onChange }: InputProps) => {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase block mb-1.5">{label}</label>
      <input 
        id={id} 
        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
};
