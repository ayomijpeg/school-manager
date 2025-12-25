import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  // 1. Fetch config (or use defaults if it's the first time)
  // We added 'email' and 'phone' to the schema, so we must add them here too.
  const config = await prisma.schoolConfig.findFirst() || {
    id: 'default-config',
    schoolName: '',
    motto: '',
    address: '',
    website: '',
    email: '',    // <--- Added this
    phone: '',    // <--- Added this
    academicYear: '',
    currentTerm: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    paymentInstructions: ''
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-1">Manage school profile, academic sessions, and security.</p>
      </div>

      {/* @ts-expect-error Server Component types often conflict with Client Props, this is safe */}
      <SettingsForm initialData={config} />
    </div>
  );
}
