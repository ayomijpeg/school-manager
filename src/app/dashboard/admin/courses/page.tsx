'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { useDataFetch } from '@/hooks/useDataFetch';
import { courseApi, levelApi } from '@/lib/api';
import { Level } from '@prisma/client';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
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
import { toast } from 'react-toastify';
import { Plus, BookOpen, Edit, Trash2 } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constant'; 

// --- TYPES (FIXED) ---
interface CourseWithLevel {
  id: string;
  name: string;
  code: string | null;
  levelId: string | null;
  departmentId: string | null;
  // FIX 1: Department is an object { name: string }, not a plain string
  department?: { name: string } | null; 
  level?: {
    name: string;
  } | null;
}

interface CourseFormState {
  name: string;
  levelId: string;
  code?: string;
  department?: string | null;
}

const ManageCoursesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormState>({
    name: '',
    levelId: '',
    code: '',
    department: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Data Fetching ---
  const { 
    data: courses, 
    isLoading: isLoadingCourses, 
    error: errorCourses, 
    refetch: refetchCourses 
  } = useDataFetch<CourseWithLevel[]>(courseApi.getAll);
  
  const { 
    data: levels, 
    isLoading: isLoadingLevels, 
    error: errorLevels 
  } = useDataFetch<Level[]>(levelApi.getAll);

  // --- Modal Control ---
  const openAddModal = () => {
    setFormData({ name: '', levelId: '', code: '', department: null });
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  // --- Form Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.levelId) {
      toast.error('Course Name and Level are required.');
      return;
    }
    setIsSubmitting(true);
    
    const apiData = {
      name: formData.name,
      levelId: formData.levelId,
      code: formData.code || undefined,
      department: formData.department || null,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await courseApi.create(apiData as any);
      
      toast.success(`Course "${apiData.name}" created successfully!`);
      closeModal();
      await refetchCourses();
    } catch (err) {
      console.error(`Failed to create course:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to create course.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- Render Logic ---
  const isLoading = isLoadingCourses || isLoadingLevels;
  const fetchError = errorCourses || errorLevels;

  if (isLoading) {
    return <Spinner fullScreen text="Loading course data..." />;
  }

  if (fetchError) {
    return <Card padding="lg"><p className="text-error-600">Error loading data: {fetchError.message}</p></Card>;
  }
  
  const safeLevels = Array.isArray(levels) ? levels : [];
  const levelOptions = safeLevels.map((level) => ({ 
      value: String(level.id), 
      label: level.name 
  }));

  const departmentOptions = DEPARTMENTS.map((dep: string) => ({ 
      value: dep, 
      label: dep 
  }));

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-h1 font-bold text-gray-900">Manage Courses</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={openAddModal}
          className="w-full sm:w-auto"
          disabled={safeLevels.length === 0}
        >
          Add New Course
        </Button>
      </div>

      {/* Courses Table */}
      {courses && courses.length > 0 ? (
        <Card padding="none" className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-gray-800 text-base py-3">{course.name}</TableCell>
                  <TableCell>{course.code || <span className="text-gray-400">N/A</span>}</TableCell>
                  <TableCell>{course.level?.name || <span className="text-gray-400">N/A</span>}</TableCell>
                  
                  {/* FIX 2: Access the .name property safely */}
                  <TableCell>{course.department?.name || <span className="text-gray-400">N/A</span>}</TableCell>
                  
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" icon={Edit} disabled title="Edit (coming soon)" />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-error-600 hover:bg-error-50 hover:text-error-700"
                      disabled
                      title="Delete (coming soon)"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Courses Created Yet"
          description="Create subjects taught at your school (e.g., Mathematics, Physics)."
          action={{
            label: "Add First Course",
            onClick: openAddModal,
            icon: Plus,
            disabled: safeLevels.length === 0
          }}
        />
      )}
      
      {safeLevels.length === 0 && (
          <p className="text-center text-warning-600 mt-4">
              You must <Link href="/dashboard/admin/levels" className="font-medium underline hover:text-warning-800">add a Level</Link> before you can create a course.
          </p>
      )}

      {/* Add Course Modal */}
     <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={"Add New Course"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange} 
            placeholder="e.g., Mathematics"
            required
            disabled={isSubmitting}
            autoFocus
          />
          <Input
            label="Course Code (Optional)"
            id="code"
            name="code"
            value={formData.code || ''}
            onChange={handleInputChange} 
            placeholder="e.g., MTH101"
            disabled={isSubmitting}
          />
          <Select
            label="Level"
            id="levelId"
            name="levelId"
            value={formData.levelId}
            onChange={handleSelectChange} 
            required
            disabled={isSubmitting}
            options={[
                { value: '', label: 'Select a level...' },
                ...levelOptions
            ]}
          />
           <Select
            label="Department (Optional)"
            id="department"
            name="department"
            value={formData.department ?? ''}
            onChange={handleSelectChange} 
            disabled={isSubmitting}
            options={[
                { value: '', label: 'Select a department (if applicable)...' },
                ...departmentOptions
            ]}
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!formData.name.trim() || !formData.levelId || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Course'}
            </Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default ManageCoursesPage;
