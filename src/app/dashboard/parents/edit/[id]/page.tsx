import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import EditParentForm from '@/components/parents/EditParentForm';

export default async function EditParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      user: true,
      students: { include: { student: true } }
    }
  });

  if (!parent) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
       <div className="mb-6">
        <Link href={`/dashboard/parents/${id}`} className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 mb-4">
             <ArrowLeft size={16} /> Back to Profile
        </Link>
        <h1 className="text-3xl font-serif text-slate-900">Edit Guardian Profile</h1>
      </div>
      
      <EditParentForm initialData={parent} />
    </div>
  );
}
