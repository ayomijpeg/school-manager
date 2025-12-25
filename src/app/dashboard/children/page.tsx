import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import WardCard from '@/components/parents/WardCard'; // Using the alias we discussed

export default async function ChildrenPage() {
  const user = await getCurrentUser();

  // Security: Only allow Parents to see this specific children list
  if (!user || user.role !== 'PARENT') {
    redirect('/dashboard');
  }

  // Fetch the wards specifically for this page
  const parent = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              level: true,
              invoices: true
            }
          }
        }
      }
    }
  });

  const wards = parent?.students.map(link => link.student) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">Registered Wards</h1>
        <p className="text-slate-500 text-sm">Detailed overview of all your children enrolled in the system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wards.map((ward) => (
          <WardCard key={ward.id} ward={ward} />
        ))}
      </div>

      {wards.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500">No wards found linked to your account.</p>
        </div>
      )}
    </div>
  );
}
