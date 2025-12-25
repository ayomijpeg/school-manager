'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import EditStudentForm from './EditStudentForm';

export default function EditStudentModal({ 
 studentId, 
  isOpen, 
  onClose,
  initialMode = 'edit' // <--- Add this prop
}: { 
  studentId: string; 
  isOpen: boolean; 
  onClose: () => void;
  initialMode?: 'edit' | 'view';
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    if (isOpen) {
      // ✅ Fix: Move logic into an async function
      const fetchData = async () => {
        setLoading(true);
        try {
          const [student, levels, departments, configData] = await Promise.all([
            fetch(`/api/students/${studentId}`).then(r => r.json()),
            fetch('/api/levels').then(r => r.json()),
            fetch('/api/departments').then(r => r.json()),
            fetch('/api/setup/school').then(r => r.json())
          ]);

          setData({ 
            student, 
            levels, 
            departments, 
            isTertiary: configData?.config?.schoolType === 'TERTIARY' 
          });
        } catch (err) {
          console.error(err);
          onClose(); // Close if error
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, studentId, onClose]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
     title={initialMode === 'view' ? "Student Profile" : "Edit Profile"}
      size="xl"
    >
      {loading ? (
        <div className="h-60 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
          <p className="text-sm font-medium">Retrieving academic record...</p>
        </div>
      ) : (
        <EditStudentForm 
          student={data.student}
          email={data.student.user?.email}
          levels={data.levels}
          departments={data.departments}
          isTertiary={data.isTertiary}
           mode={initialMode} 
          onSuccess={onClose} // <--- Important: Closes modal on save
        />
      )}
    </Modal>
  );
}
