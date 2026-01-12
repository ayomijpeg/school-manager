'use client';

import React, { useState } from 'react';
import { useDataFetch } from '@/hooks/useDataFetch';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Exam {
  id: string;
  name: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
}

export default function ManageExamsPage() {
  const fetcher = async () => {
    const res = await fetch('/api/exams');
    if (!res.ok) throw new Error('Failed to fetch exams');
    return res.json();
  };

  const { data: exams, isLoading, error, refetch } = useDataFetch<Exam[]>(fetcher);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Sanitize Data (Convert empty strings to undefined)
    const payload = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
    };

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // 2. Parse the response to get the real error message
      const data = await res.json();
      
      if (!res.ok) {
        // Use the API's error message if available
        throw new Error(data.error || "Failed to create exam");
      }
      
      toast.success("Exam created successfully!");
      setIsModalOpen(false);
      setFormData({ ...formData, name: '' });
      refetch();
    } catch (err) {
      console.error(err);
      // 3. Show the specific error in the Toast
      toast.error(err instanceof Error ? err.message : "Error creating exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure? This will delete all results associated with this exam.")) return;
    try {
        const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed to delete");

        toast.success("Exam deleted.");
        refetch();
    } catch(e) { 
        toast.error("Could not delete exam."); 
    }
  };

  if (isLoading) return <Spinner fullScreen text="Loading exams..." />;
  
  if (error) return <div className="p-6 text-red-500">Error loading data: {String(error)}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Manage Exams</h1>
           <p className="text-slate-500 text-sm">Create examination periods (e.g., First Term, Mid-Term) to record results.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Create Exam</Button>
      </div>

      {exams && exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} padding="md" className="flex justify-between items-center group hover:border-emerald-500 transition-colors">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{exam.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                   <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">{exam.academicYear}</span>
                   {exam.startDate && (
                     <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(exam.startDate).toLocaleDateString()}</span>
                   )}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(exam.id)} className="text-red-500 hover:bg-red-50" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
            icon={Calendar} 
            title="No Exams Created" 
            description="You need to create an exam period before you can upload student results."
            action={{ label: "Create First Exam", onClick: () => setIsModalOpen(true), icon: Plus }}
        />
      )}

      {/* CREATE EXAM MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Exam">
        <form onSubmit={handleSubmit} className="space-y-4">
           <Input 
              label="Exam Name" 
              name="name" 
              placeholder="e.g. First Term Examination" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
           />
           <Input 
              label="Academic Year" 
              name="academicYear" 
              placeholder="e.g. 2024/2025" 
              value={formData.academicYear}
              onChange={e => setFormData({...formData, academicYear: e.target.value})}
              required
           />
           <div className="grid grid-cols-2 gap-4">
              <Input 
                type="date"
                label="Start Date (Optional)" 
                name="startDate" 
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
               <Input 
                type="date"
                label="End Date (Optional)" 
                name="endDate" 
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
           </div>
           
           <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isSubmitting}>Save Exam</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
