'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2, Eye, BookPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import TeacherForm from './TeacherForm';
import ManageAssignmentsModal from './ManageAssignmentsModal';
import ViewTeacherModal from './ViewTeacherModal';

// 1. Exact shape from Database (Prisma)
interface TeacherFromDB {
  id: string;
  fullName: string;
  staffId: string | null;       
  contactPhone: string | null;  
  departmentId: string | null;
  department: { name: string; id: string } | null; 
  user: { email: string | null } | null;
}

type Props = {
  teacher: TeacherFromDB; 
  classes: { id: string; name: string; levelId: string }[]; 
  courses: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  levels: { id: string; name: string }[];
};

export default function TeacherActions({ teacher, classes, courses, departments, levels = [] }: Props) {
  const router = useRouter();
  
  const [showAssign, setShowAssign] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ CRITICAL FIX: Strictly sanitize types for child components
  const sanitizedTeacher = {
    id: teacher.id,
    fullName: teacher.fullName,
    staffId: teacher.staffId ?? undefined,
    contactPhone: teacher.contactPhone ?? undefined,
    departmentId: teacher.departmentId ?? undefined,
    department: teacher.department ?? undefined,
    user: teacher.user ? { email: teacher.user.email ?? "" } : undefined
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to archive ${teacher.fullName}?`)) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/teachers/${teacher.id}`, { method: 'DELETE' });
      toast.success("Staff archived");
      router.refresh();
    } catch { 
        toast.error("Failed to archive"); 
    } finally { 
      setIsDeleting(false); 
      setIsMenuOpen(false); 
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 relative">
      <button 
        onClick={() => setShowAssign(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
      >
        <BookPlus size={14} />
        <span>Assign</span>
      </button>

      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
          className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <MoreHorizontal size={18}/>}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <button 
              onClick={() => { setShowView(true); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex gap-2 items-center"
            >
              <Eye size={16} className="text-slate-400"/> View Details
            </button>

            <button 
              onClick={() => { setShowAssign(true); setIsMenuOpen(false); }}
              className="md:hidden w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex gap-2 items-center"
            >
              <BookPlus size={16} /> Assign Classes
            </button>

            <button 
              onClick={() => { setShowEdit(true); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex gap-2 items-center"
            >
              <Pencil size={16} className="text-slate-400"/> Edit Profile
            </button>
            
            <div className="h-px bg-slate-100 my-1"></div>
            
            <button 
              onClick={handleDelete}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex gap-2 items-center"
            >
              <Trash2 size={16} /> Archive
            </button>
          </div>
        )}
      </div>

      {showAssign && (
        <ManageAssignmentsModal 
          isOpen={showAssign}
          onClose={() => setShowAssign(false)}
          teacherId={teacher.id}
          teacherName={teacher.fullName}
          levels={levels}
          classes={classes}
          courses={courses}
        />
      )}

      {showView && (
        <ViewTeacherModal 
          isOpen={showView} 
          onClose={() => setShowView(false)} 
          teacher={sanitizedTeacher} 
        />
      )}

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Staff">
         <TeacherForm 
            teacher={sanitizedTeacher} 
            email={teacher.user?.email || ''} 
            departments={departments}
            onSuccess={() => setShowEdit(false)}
        />
      </Modal>

    </div>
  );
}
