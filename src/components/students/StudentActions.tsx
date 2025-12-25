'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  FileText, 
  Loader2, 
  AlertTriangle,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';
import EditStudentModal from './EditStudentModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function StudentActions({ 
  studentId, 
  studentName 
}: { 
  studentId: string, 
  studentName: string 
}) {
  const router = useRouter();
  
  // State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // --- SENIOR DEV UPGRADE: Custom Archive Modal State ---
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  // Menu Positioning
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('edit');

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ 
        top: rect.bottom + window.scrollY + 5, 
        left: rect.left + window.scrollX - 160 
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const close = () => setIsDropdownOpen(false);
    window.addEventListener('scroll', close);
    return () => window.removeEventListener('scroll', close);
  }, []);

  // --- THE REAL ARCHIVE LOGIC ---
  const handleArchiveConfirm = async () => {
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed");
      
      toast.success("Student archived", {
        description: `${studentName} has been moved to archives.`
      });
      router.refresh();
      setIsArchiveOpen(false); // Close Modal
    } catch (error) {
      toast.error("Could not archive student");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      {/* 1. TRIGGER BUTTON */}
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`p-2 rounded-lg transition-all border border-transparent ${
          isDropdownOpen 
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
            : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-100'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* 2. DROPDOWN MENU */}
      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
          <div 
            className="fixed z-50 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button 
              onClick={() => {
                setIsDropdownOpen(false);
                 setModalMode('edit');
                setIsEditModalOpen(true);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
            
            <button 
               onClick={() => {
                 setIsDropdownOpen(false);
                   setModalMode('view');
                  setIsEditModalOpen(true);
               }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> View Details
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button 
              onClick={() => {
                setIsDropdownOpen(false);
                setIsArchiveOpen(true); // <--- OPEN CUSTOM MODAL
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Archive Student
            </button>
          </div>
        </>
      )}

      {/* 3. EDIT MODAL */}
      <EditStudentModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
          initialMode={modalMode}
        studentId={studentId} 
      />

      {/* 4. ARCHIVE CONFIRMATION MODAL (The Fix) */}
      <Modal 
        isOpen={isArchiveOpen} 
        onClose={() => setIsArchiveOpen(false)}
        title="Archive Student"
        size="sm"
      >
        <div className="text-center p-2">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            This will remove <span className="font-bold text-slate-700">{studentName}</span> from the active student list. Their records will be preserved in the archive.
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => setIsArchiveOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <Button 
              variant="primary" 
              isLoading={isArchiving}
              onClick={handleArchiveConfirm}
              className="bg-red-600 hover:bg-red-700 text-white shadow-red-900/10 border-transparent"
            >
              Yes, Archive
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
