'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  FileText,  
  AlertTriangle,
  UserMinus,
  Award,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import EditStudentModal from './EditStudentModal';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

// 🟢 FIXED: Explicitly define props to prevent Next.js "Page" type conflict
interface StudentActionsProps {
  studentId: string;
  studentName: string;
}

export default function StudentActions({ 
  studentId, 
  studentName 
}: StudentActionsProps) {
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('edit');

  // Status Change State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Archive State
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

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

  // --- STATUS CHANGE LOGIC ---
  const handleStatusUpdate = async () => {
    if (!pendingStatus) return;
    setIsUpdating(true);
    try {
      // Logic: Using a PATCH request to your status API
      const res = await fetch(`/api/students/${studentId}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Student Status Updated`, {
        description: `${studentName} is now marked as ${pendingStatus}.`
      });
      router.refresh();
      setIsStatusModalOpen(false);
    } catch  {
      toast.error("Could not update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchiveConfirm = async () => {
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed");
      
      toast.success("Student archived", {
        description: `${studentName} has been moved to archives.`
      });
      router.refresh();
      setIsArchiveOpen(false);
    } catch  {
      toast.error("Could not archive student");
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`p-2 rounded-lg transition-all border border-transparent ${
          isDropdownOpen ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-emerald-50'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
          <div 
            className="fixed z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button onClick={() => { setIsDropdownOpen(false); setModalMode('view'); setIsEditModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> View Profile
            </button>
            <button onClick={() => { setIsDropdownOpen(false); setModalMode('edit'); setIsEditModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-slate-400" /> Edit Details
            </button>

            <div className="h-px bg-slate-100 my-1" />
            <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status</p>
            
            <button onClick={() => { setIsDropdownOpen(false); setPendingStatus('GRADUATED'); setIsStatusModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
              <Award className="w-4 h-4" /> Mark Graduated
            </button>
            <button onClick={() => { setIsDropdownOpen(false); setPendingStatus('REPEATING'); setIsStatusModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Mark Repeating
            </button>
            <button onClick={() => { setIsDropdownOpen(false); setPendingStatus('WITHDRAWN'); setIsStatusModalOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <UserMinus className="w-4 h-4" /> Student Withdrew
            </button>

            <div className="h-px bg-slate-100 my-1" />
            <button onClick={() => { setIsDropdownOpen(false); setIsArchiveOpen(true); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Archive Student
            </button>
          </div>
        </>
      )}

      {/* --- STATUS CHANGE MODAL --- */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Change Status" size="sm">
        <div className="text-center p-2">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Update to {pendingStatus}?</h3>
          <p className="text-sm text-slate-500 mb-6">Changing status for <span className="font-bold text-slate-700">{studentName}</span>.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
            <Button variant="primary" isLoading={isUpdating} onClick={handleStatusUpdate}>Confirm Change</Button>
          </div>
        </div>
      </Modal>

      {/* --- ARCHIVE MODAL --- */}
      <Modal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} title="Archive Student" size="sm">
        <div className="text-center p-2">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-sm text-slate-500 mb-6 font-medium">This will archive {studentName}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setIsArchiveOpen(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
            <Button className="bg-red-600 text-white" isLoading={isArchiving} onClick={handleArchiveConfirm}>Yes, Archive</Button>
          </div>
        </div>
      </Modal>

      <EditStudentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} initialMode={modalMode} studentId={studentId} />
    </>
  );
}
