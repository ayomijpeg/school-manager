import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditParentForm from '@/components/parents/EditParentForm'; // Reuse the form

export default function AddParentPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <Link href="/dashboard/parents" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 mb-4">
             <ArrowLeft size={16} /> Back to Registry
        </Link>
        <h1 className="text-3xl font-serif text-slate-900">Register New Guardian</h1>
        <p className="text-slate-500 mt-1">Create a parent profile. You can link students now or later.</p>
      </div>

      {/* Render form without initial data = Create Mode */}
      <EditParentForm />
    </div>
  );
}
