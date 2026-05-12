'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useDataFetch } from '@/hooks/useDataFetch';
import { classApi, levelApi } from '@/lib/api';
import { Level, Class } from '@prisma/client'; // 🟢 Removed 'Department' (unused)
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { DEPARTMENTS } from '@/lib/constant';

// Icons
import { Plus, School, Edit, Trash2 } from 'lucide-react';

// UI Components
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

// Update Interface to include all fields used in the UI
interface LocalClassWithLevel extends Class {
  level: { name: string };
  department?: { name: string; id: string } | null; 
  roomNumber: string | null; // 🟢 Added to fix Error 2
}

interface ClassFormData {
  name: string;
  levelId: string;
  roomNumber: string;
  departmentId: string;
}

export default function ManageClassesPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentClass, setCurrentClass] = useState<LocalClassWithLevel | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ClassFormData>({ 
    name: '', levelId: '', roomNumber: '', departmentId: '' 
  });

  const { data: classes, isLoading: isLoadingClasses, refetch: refetchClasses } = 
    useDataFetch<LocalClassWithLevel[]>(classApi.getAll as () => Promise<LocalClassWithLevel[]>);
  
  const { data: levels, isLoading: isLoadingLevels } = useDataFetch<Level[]>(levelApi.getAll);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentClass(null);
    setFormData({ name: '', levelId: '', roomNumber: '', departmentId: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (cls: LocalClassWithLevel) => {
    setModalMode('edit');
    setCurrentClass(cls);
    setFormData({
      name: cls.name,
      levelId: cls.levelId,
      roomNumber: cls.roomNumber || '',
      departmentId: cls.departmentId || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      levelId: formData.levelId,
      roomNumber: formData.roomNumber || null,
      departmentId: formData.departmentId || null,
    };

    try {
      if (modalMode === 'add') {
        await classApi.create(payload);
        toast.success("Class created!");
      } else if (currentClass) {
        await classApi.update(currentClass.id, payload);
        toast.success("Class updated!");
      }
      setIsFormModalOpen(false);
      await refetchClasses();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Action failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentClass) return;
    setIsSubmitting(true);
    try {
      await classApi.delete(currentClass.id);
      toast.success("Class deleted");
      setIsDeleteModalOpen(false);
      await refetchClasses();
    } catch {
      toast.error("Cannot delete class. Ensure it has no students.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingClasses || isLoadingLevels) return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;

  const levelOptions = levels?.map(l => ({ value: l.id, label: l.name })) || [];
  
  // 🟢 FIXED: Type-safe mapping for DEPARTMENTS to fix Error 1
  const departmentOptions = DEPARTMENTS.map((d: any) => {
    if (typeof d === 'string') return { value: d, label: d };
    return { value: d.value || d.id, label: d.label || d.name };
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Classes</h1>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>Create Class</Button>
      </div>

      {classes && classes.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.level.name} / {cls.name}</TableCell>
                  <TableCell>
                    {cls.department ? (
                      <Badge variant="info">{cls.department.name}</Badge>
                    ) : <span className="text-gray-400 italic">General</span>}
                  </TableCell>
                  <TableCell>{cls.roomNumber || '-'}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" icon={Edit} onClick={() => openEditModal(cls)} />
                    <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600" onClick={() => { setCurrentClass(cls); setIsDeleteModalOpen(true); }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState icon={School} title="No Classes" description="Add your first class to get started." />
      )}

      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={modalMode === 'add' ? "New Class" : "Edit Class"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input label="Class Arm" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Select label="Level" name="levelId" value={formData.levelId} onChange={e => setFormData({...formData, levelId: e.target.value})} options={[{value: '', label: 'Select Level'}, ...levelOptions]} required />
          <Select label="Department" name="departmentId" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} options={[{value: '', label: 'None'}, ...departmentOptions]} />
          <Input label="Room No." name="roomNumber" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="primary" type="submit" isLoading={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
         <div className="text-center p-4">
            <p>Delete <strong>{currentClass?.name}</strong>? This cannot be undone.</p>
            <div className="flex justify-center gap-3 mt-6">
               <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>Delete</Button>
            </div>
         </div>
      </Modal>
    </motion.div>
  );
}
