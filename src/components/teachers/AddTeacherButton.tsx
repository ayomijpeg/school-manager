'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import TeacherForm from './TeacherForm';

interface Department {
  id: string;
  name: string;
}

interface AddTeacherButtonProps {
  departments: Department[];
}

export default function AddTeacherButton({ departments }: AddTeacherButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm shadow-slate-200 font-medium text-sm"
      >
        <Plus size={16} />
        Add Staff
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Onboard New Staff">
        {/* Pass departments down to the form */}
        <TeacherForm 
          departments={departments} 
          onSuccess={() => setIsOpen(false)} 
        />
      </Modal>
    </>
  );
}
