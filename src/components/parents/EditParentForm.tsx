'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Search, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { studentApi } from '@/lib/api';
import { debounce } from '@/lib/utils';

export default function EditParentForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse FullName back to First/Last (Approximate)
  const nameParts = initialData.fullName.split(' ');
  const lastName = nameParts[0];
  const firstName = nameParts.slice(1).join(' ');

  // Extract linked students IDs and Objects
  const initialIds = initialData.students.map((s: any) => s.studentId);
  const initialObjects = initialData.students.map((s: any) => s.student);

  const [formData, setFormData] = useState({
    firstName, 
    lastName, 
    email: initialData.user.email, 
    contactPhone: initialData.contactPhone || '',
    studentIds: initialIds as string[]
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<any[]>(initialObjects);
  const [isSearching, setIsSearching] = useState(false);

  // Reusing Search Logic
  const performSearch = React.useCallback(debounce(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    try {
        setIsSearching(true);
        const res = await studentApi.getAll(q);
        setSearchResults(res);
    } catch(e) {} finally { setIsSearching(false); }
  }, 500), []);

  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
    performSearch(e.target.value);
  }

  const addStudent = (student: any) => {
    if (formData.studentIds.includes(student.id)) return;
    setFormData(prev => ({ ...prev, studentIds: [...prev.studentIds, student.id] }));
    setSelectedStudents(prev => [...prev, student]);
    setSearchQuery(''); setSearchResults([]);
  };

  const removeStudent = (id: string) => {
    setFormData(prev => ({ ...prev, studentIds: prev.studentIds.filter(sid => sid !== id) }));
    setSelectedStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await fetch(`/api/parents/${initialData.id}`, {
            method: 'PATCH',
            body: JSON.stringify(formData),
            headers: {'Content-Type': 'application/json'}
        });
        if(!res.ok) throw new Error("Failed");
        toast.success("Profile Updated");
        router.push('/dashboard/parents');
        router.refresh();
    } catch(e) {
        toast.error("Update failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><User size={18}/> Guardian Info</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" value={formData.firstName} onChange={v => setFormData({...formData, firstName: v})} />
              <Input label="Last Name" value={formData.lastName} onChange={v => setFormData({...formData, lastName: v})} />
              <Input label="Email" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
              <Input label="Phone" value={formData.contactPhone} onChange={v => setFormData({...formData, contactPhone: v})} />
           </div>
        </div>

        {/* Child Linking Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
           <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Search size={18}/> Manage Wards</h2>
           
           <div className="relative mb-4">
             <input className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                placeholder="Search to add another child..." 
                value={searchQuery} onChange={handleSearch} />
             
             {searchQuery.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                    {searchResults.map(s => (
                        <button type="button" key={s.id} onClick={() => addStudent(s)} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50">
                            {s.fullName} <span className="text-xs text-slate-400">({s.matricNumber})</span>
                        </button>
                    ))}
                </div>
             )}
           </div>

           <div className="flex flex-wrap gap-2">
              {selectedStudents.map(s => (
                  <div key={s.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium">
                      <span>{s.fullName}</span>
                      <button type="button" onClick={() => removeStudent(s.id)}><X size={14}/></button>
                  </div>
              ))}
           </div>
        </div>

        <div className="flex justify-end gap-3">
             <Button variant="ghost" onClick={() => router.back()} type="button">Cancel</Button>
             <Button variant="primary" isLoading={isLoading}>Save Changes</Button>
        </div>
    </form>
  );
}

const Input = ({ label, value, onChange }: any) => (
    <div><label className="text-xs font-bold text-slate-500 uppercase">{label}</label><input className="w-full border rounded-lg p-2 bg-slate-50" value={value} onChange={e => onChange(e.target.value)} /></div>
);
