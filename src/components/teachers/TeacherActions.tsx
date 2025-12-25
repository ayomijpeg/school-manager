'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import TeacherForm from './TeacherForm';

// 1. Define Types to fix "never[]" error
interface Department {
  id: string;
  name: string;
}

interface TeacherData {
  id: string;
  fullName: string;
  contactPhone?: string;
  departmentId?: string;
  user?: { email: string };
}

export default function TeacherActions({ teacherId, teacherName }: { teacherId: string, teacherName: string }) {
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 2. Explicit Typing for State
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX - 140 });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
     const close = () => setIsDropdownOpen(false);
     window.addEventListener('scroll', close);
     return () => window.removeEventListener('scroll', close);
  }, []);

  const openEdit = async () => {
    setIsDropdownOpen(false);
    try {
        const [t, d] = await Promise.all([
            fetch(`/api/teachers/${teacherId}`).then(r => r.json()),
            fetch('/api/departments').then(r => r.json())
        ]);
        setTeacherData(t);
        // Ensure d is an array before setting
        setDepartments(Array.isArray(d) ? d : []);
        setIsEditModalOpen(true);
    } catch (err) {
        toast.error("Failed to load details");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Archive ${teacherName}?`)) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
      toast.success("Staff archived");
      router.refresh();
    } catch (e) { toast.error("Failed"); }
    finally { setIsDeleting(false); setIsDropdownOpen(false); }
  };

  return (
    <>
      <button 
        ref={buttonRef} 
        onClick={toggleDropdown} 
        aria-label="Open actions"
        className="p-2 text-slate-400 hover:bg-emerald-50 rounded-lg transition-colors"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <MoreHorizontal className="w-4 h-4"/>}
      </button>

      {isDropdownOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            <div className="fixed z-50 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1" style={{ top: menuPos.top, left: menuPos.left }}>
                <button onClick={openEdit} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex gap-2 items-center">
                    <Pencil size={14}/> Edit
                </button>
                <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex gap-2 items-center">
                    <Trash2 size={14}/> Archive
                </button>
            </div>
        </>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Staff">
         {teacherData && (
            <TeacherForm 
                teacher={teacherData} 
                email={teacherData.user?.email} 
                departments={departments}
                onSuccess={() => setIsEditModalOpen(false)}
            />
         )}
      </Modal>
    </>
  );
}
