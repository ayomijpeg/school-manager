// src/app/dashboard/admin/levels/page.tsx
'use client';

import React, { useState } from 'react';
import { useDataFetch } from '@/hooks/useDataFetch';
import { levelApi } from '@/lib/api'; 
import { Level } from '@prisma/client';
import { toast } from 'sonner'; // Recommending Sonner for cleaner UI
import { motion, AnimatePresence } from 'framer-motion'; // Animation library

// Icons
import { Plus, Layers, Edit, Trash2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

// UI Components
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import {
    Table, 
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";

interface LevelFormData {
  name: string;
  // Add other fields if your schema has them (e.g. section, fee)
}

export default function ManageLevelsPage() {
  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<LevelFormData>({ name: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  const { data: levels, isLoading, error, refetch } = useDataFetch<Level[]>(levelApi.getAll);

  // --- Handlers ---

  const openAddModal = () => {
    setModalMode('add');
    setCurrentLevel(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (level: Level) => {
    setModalMode('edit');
    setCurrentLevel(level);
    setFormData({ name: level.name });
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    // Small delay to clear state after animation
    setTimeout(() => {
        setCurrentLevel(null);
        setFormData({ name: '' });
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    // 1. STOP RELOAD
    e.preventDefault(); 
    
    if (!formData.name.trim()) {
      toast.error('Level name cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (modalMode === 'add') {
        await levelApi.create({ name: formData.name });
        toast.success(`Level "${formData.name}" created!`);
      } else if (modalMode === 'edit' && currentLevel) {
        await levelApi.update(currentLevel.id, { name: formData.name });
        toast.success(`Level updated to "${formData.name}"`);
      }

      // 2. Close & Refresh
      closeFormModal();
      await refetch(); // Updates the table without page reload

    } catch (err: any) {
      console.error(`Failed to ${modalMode} level:`, err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentLevel) return;
    setIsSubmitting(true); // Reuse submitting state
    try {
      await levelApi.delete(currentLevel.id);
      toast.success(`Level deleted successfully`);
      closeDeleteModal();
      await refetch();
    } catch (err: any) {
       // Handle specific Prisma Foreign Key errors
       if (err.message?.includes('constraint') || err.response?.status === 409) {
         toast.error("Cannot delete: This level has students or classes linked to it.");
       } else {
         toast.error("Failed to delete level");
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => setCurrentLevel(null), 300);
  };


  // --- Render ---

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size="lg" text="Loading Levels..." />
    </div>
  );

  if (error) return (
    <div className="p-6">
      <Card className="border-red-200 bg-red-50">
        <div className="flex items-center gap-3 text-red-800">
           <AlertTriangle className="h-5 w-5" />
           <p>Error loading levels: {error.message}</p>
        </div>
      </Card>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-heading">Manage Levels</h1>
          <p className="text-gray-500 mt-1">Configure the academic hierarchy (JSS 1, SS 3, etc.)</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal} className="shadow-lg shadow-primary-500/20">
          Add Level
        </Button>
      </div>

      {/* Table Content */}
      {levels && levels.length > 0 ? (
        <Card className="overflow-hidden border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[60%] pl-6">Level Name</TableHead>
                  <TableHead className="w-[20%]">Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {levels.map((level, index) => (
                    <motion.tr
                      key={level.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                            {level.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{level.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                         </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" icon={Edit} onClick={() => openEditModal(level)} />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={Trash2} 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { setCurrentLevel(level); setIsDeleteModalOpen(true); }} 
                          />
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
          icon={Layers}
          title="No Levels Found"
          description="Get started by adding your first academic level."
          action={{ label: "Add Level", onClick: openAddModal, icon: Plus }}
        />
      )}

      {/* --- MODALS --- */}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeFormModal}
        title={modalMode === 'add' ? "Create New Level" : "Edit Level"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <Input
            label="Level Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Primary 1"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeFormModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Level"
      >
        <div className="text-center space-y-4">
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
             <AlertTriangle className="h-6 w-6 text-red-600" />
           </div>
           <div>
             <h3 className="text-lg font-medium leading-6 text-gray-900">Delete {currentLevel?.name}?</h3>
             <p className="mt-2 text-sm text-gray-500">
               Are you sure? This action cannot be undone. If any students are enrolled in this level, you might be blocked from deleting it.
             </p>
           </div>
           <div className="flex justify-center gap-3 mt-4">
             <Button variant="secondary" onClick={closeDeleteModal} disabled={isSubmitting}>Cancel</Button>
             <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>Delete Level</Button>
           </div>
        </div>
      </Modal>

    </motion.div>
  );
}
