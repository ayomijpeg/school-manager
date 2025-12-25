'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import TeacherForm from './TeacherForm'; // Reuse the form we made earlier
import { useEffect } from 'react';

export default function AddTeacherButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/departments')
        .then(r => r.json())
        .then(data => setDepartments(Array.isArray(data) ? data : []));
    }
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2 bg-emerald-800 text-white rounded-full text-sm font-medium hover:bg-emerald-900 shadow-lg shadow-emerald-900/10 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Staff
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Onboard New Staff">
        <TeacherForm 
          departments={departments}
          onSuccess={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
