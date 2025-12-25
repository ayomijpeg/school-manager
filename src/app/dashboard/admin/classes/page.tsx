'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDataFetch } from '@/hooks/useDataFetch';
import { classApi, levelApi } from '@/lib/api';
import { Level, Class, Department } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner'; // Using Sonner
import { DEPARTMENTS } from '@/lib/constant';

// Icons
import { Plus, School, Edit, Trash2, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';

// UI Components
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

interface ClassWithLevel extends Class {
  level: { name: string };
}

interface ClassFormData {
  name: string;
  levelId: string;
  roomNumber: string;
  department: string;
}

export default function ManageClassesPage() {
  // --- State ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentClass, setCurrentClass] = useState<ClassWithLevel | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ClassFormData>({ 
    name: '', levelId: '', roomNumber: '', department: '' 
  });

  // --- Fetch Data ---
  const { 
    data: classes, 
    isLoading: isLoadingClasses, 
    error: errorClasses, 
    refetch: refetchClasses 
  } = useDataFetch<ClassWithLevel[]>(classApi.getAll);
  
  const { 
    data: levels, 
    isLoading: isLoadingLevels 
  } = useDataFetch<Level[]>(levelApi.getAll);

  // --- Handlers ---
  const openAddModal = () => {
    setModalMode('add');
    setCurrentClass(null);
    setFormData({ name: '', levelId: '', roomNumber: '', department: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (cls: ClassWithLevel) => {
    setModalMode('edit');
    setCurrentClass(cls);
    setFormData({
      name: cls.name,
      levelId: cls.levelId,
      roomNumber: cls.roomNumber || '',
      department: cls.department || '',
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => setIsFormModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.levelId) {
      toast.error('Class Name and Level are required.');
      return;
    }

    setIsSubmitting(true);

    // Convert empty strings to null for the API
    const payload = {
      name: formData.name,
      levelId: formData.levelId,
      roomNumber: formData.roomNumber || null,
      department: (formData.department as Department) || null,
    };

    try {
      if (modalMode === 'add') {
        await classApi.create(payload);
        toast.success(`Class "${payload.name}" created!`);
      } else {
        await classApi.update(currentClass!.id, payload);
        toast.success(`Class updated successfully`);
      }
      closeFormModal();
      await refetchClasses();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Operation failed");
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
    } catch (err: any) {
      toast.error("Cannot delete class. Check if students are enrolled.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading / Error ---
  if (isLoadingClasses || isLoadingLevels) return (
    <div className="flex h-[60vh] items-center justify-center">
       <Spinner size="lg" text="Loading Data..." />
    </div>
  );

  if (errorClasses) return <Card><p className="text-red-600">Error: {errorClasses.message}</p></Card>;

  // --- Options ---
  const levelOptions = levels?.map(l => ({ value: l.id, label: l.name })) || [];
  const departmentOptions = DEPARTMENTS.map(d => ({ value: d.value, label: d.label }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Manage Classes</h1>
          <p className="text-gray-500 mt-1">Organize students into classes and streams (Science, Arts).</p>
        </div>
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={openAddModal} 
          disabled={!levels || levels.length === 0}
        >
          Create Class
        </Button>
      </div>

      {/* Content */}
      {classes && classes.length > 0 ? (
        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {classes.map((cls, idx) => (
                    <motion.tr
                      key={cls.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">{cls.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                          {cls.level.name}
                        </span>
                      </TableCell>
                      <TableCell>
                         {cls.department ? (
                           <Badge variant={cls.department === 'SCIENCE' ? 'info' : cls.department === 'ARTS' ? 'warning' : 'default'}>
                             {cls.department}
                           </Badge>
                         ) : <span className="text-gray-400 italic text-sm">General</span>}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{cls.roomNumber || '-'}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" icon={Edit} onClick={() => openEditModal(cls)} />
                            <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600 hover:bg-red-50" onClick={() => { setCurrentClass(cls); setIsDeleteModalOpen(true); }} />
                         </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={School}
          title="No Classes Found"
          description="Create your first class to start enrolling students."
          action={{ label: "Create Class", onClick: openAddModal, icon: Plus, disabled: !levels?.length }}
        />
      )}

      {/* Warning if no levels */}
      {(!levels || levels.length === 0) && !isLoadingLevels && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          <p>You need to <Link href="/dashboard/admin/levels" className="underline font-semibold">create Levels</Link> (e.g. JSS 1) before adding classes.</p>
        </div>
      )}

      {/* --- Modals --- */}
      
      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={modalMode === 'add' ? "New Class" : "Edit Class"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Class Name (e.g. A)" name="name" value={formData.name} onChange={handleChange} required placeholder="A" />
            <Select 
              label="Level" 
              name="levelId" 
              value={formData.levelId} 
              onChange={handleChange} 
              required 
              options={[{ value: '', label: 'Select Level' }, ...levelOptions]} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Select 
              label="Department (Optional)" 
              name="department" 
              value={formData.department} 
              onChange={handleChange} 
              options={[{ value: '', label: 'None' }, ...departmentOptions]} 
            />
            <Input label="Room No. (Optional)" name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="101" />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
            <Button type="button" variant="secondary" onClick={closeFormModal}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Save Class</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Class">
         <div className="text-center space-y-4">
            <div className="mx-auto bg-red-100 h-12 w-12 rounded-full flex items-center justify-center text-red-600"><AlertTriangle /></div>
            <p>Are you sure you want to delete <strong>{currentClass?.name}</strong>? This cannot be undone.</p>
            <div className="flex justify-center gap-3">
               <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
               <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>Delete</Button>
            </div>
         </div>
      </Modal>

    </motion.div>
  );
}
