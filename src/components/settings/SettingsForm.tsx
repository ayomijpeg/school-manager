'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Import cn for class merging
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  Lock, 
  Save, 
  Loader2, 
  Eye, 
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Database,
  AlertTriangle,
  Trash2,
  ShieldAlert
} from 'lucide-react';

// --- 1. FIXED HELPER COMPONENTS ---

const SectionLabel = ({ label }: { label: string }) => (
  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
    {label}
  </label>
);

// FIX: Now uses 'cn' to merge classes (allows pl-10 to work)
const InputField = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={cn(
      "w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600",
      className
    )}
  />
);

const TextAreaField = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className={cn(
      "w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 min-h-[100px]",
      className
    )}
  />
);

// --- MAIN COMPONENT ---

type SettingsFormProps = {
  initialData: any; 
};

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: initialData?.schoolName || '',
    motto: initialData?.motto || '',
    address: initialData?.address || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    academicYear: initialData?.academicYear || '2025/2026',
    currentTerm: initialData?.currentTerm || 'First Term',
    bankName: initialData?.bankName || '',
    accountNumber: initialData?.accountNumber || '',
    accountName: initialData?.accountName || '',
    paymentInstructions: initialData?.paymentInstructions || '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [cleanPhrase, setCleanPhrase] = useState('');
  const [cleanPassword, setCleanPassword] = useState('');
  const [includeTeachers, setIncludeTeachers] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      
      toast.success('Settings updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            currentPassword: passData.currentPassword,
            newPassword: passData.newPassword 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      toast.success('Password changed successfully');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanPhrase !== 'CLEAN TEST DATA') {
      toast.error('Please type "CLEAN TEST DATA" exactly as shown.');
      return;
    }
    if (!cleanPassword) {
      toast.error('Please enter your administrator password.');
      return;
    }
    if (
      !window.confirm(
        '⚠️ FINAL WARNING: This action will permanently delete all test students, parents, invoices, payments, attendance, and results. A backup will be saved automatically. Do you want to proceed?'
      )
    ) {
      return;
    }

    setIsCleaning(true);
    try {
      const res = await fetch('/api/admin/clean-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPhrase: cleanPhrase,
          password: cleanPassword,
          includeTeachers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clean database');

      toast.success(data.message || 'Database successfully cleaned! Ready for fresh school data.');
      setCleanPhrase('');
      setCleanPassword('');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCleaning(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'School Profile', icon: Building2 },
    { id: 'academic', label: 'Academic Session', icon: Calendar },
    { id: 'billing', label: 'Billing & Finance', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'launch', label: 'Fresh Launch & Data', icon: Database },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        
        {/* TABS */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-b-2",
                  isActive 
                    ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-8">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div>
                <SectionLabel label="School Name" />
                <InputField 
                  value={formData.schoolName}
                  onChange={e => setFormData({...formData, schoolName: e.target.value})}
                  placeholder="e.g. Ayomi International School"
                />
              </div>

              <div>
                <SectionLabel label="Motto / Slogan" />
                <InputField 
                  value={formData.motto}
                  onChange={e => setFormData({...formData, motto: e.target.value})}
                  placeholder="e.g. Excellence & Virtue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <SectionLabel label="Email Address" />
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
                        <InputField 
                            className="pl-10" // This now correctly adds padding
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="info@school.com"
                        />
                    </div>
                 </div>
                 <div>
                    <SectionLabel label="Phone Number" />
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
                        <InputField 
                            className="pl-10" // This now correctly adds padding
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="+234..."
                        />
                    </div>
                 </div>
              </div>

              <div>
                <SectionLabel label="Address" />
                <div className="relative">
                    <MapPin className="absolute left-3 top-4 text-slate-400 dark:text-slate-500 w-5 h-5 pointer-events-none" />
                    <TextAreaField 
                      className="pl-10"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="School location..."
                    />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACADEMIC */}
          {activeTab === 'academic' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-lg animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <SectionLabel label="Current Session" />
                    <InputField 
                        value={formData.academicYear}
                        onChange={e => setFormData({...formData, academicYear: e.target.value})}
                    />
                 </div>
                 <div>
                    <SectionLabel label="Current Term" />
                    <select 
                        value={formData.currentTerm}
                        onChange={e => setFormData({...formData, currentTerm: e.target.value})}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option>First Term</option>
                        <option>Second Term</option>
                        <option>Third Term</option>
                    </select>
                 </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                  Update Session
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BILLING */}
          {activeTab === 'billing' && (
             <form onSubmit={handleSave} className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl mb-6">
                    <p className="text-sm text-amber-800 dark:text-amber-500">
                        These details will appear on generated invoices and receipts.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <SectionLabel label="Bank Name" />
                        <InputField 
                            value={formData.bankName}
                            onChange={e => setFormData({...formData, bankName: e.target.value})}
                            placeholder="e.g. First Bank"
                        />
                    </div>
                    <div>
                        <SectionLabel label="Account Number" />
                        <InputField 
                            value={formData.accountNumber}
                            onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                            placeholder="e.g. 203..."
                        />
                    </div>
                </div>

                <div>
                    <SectionLabel label="Account Name" />
                    <InputField 
                        value={formData.accountName}
                        onChange={e => setFormData({...formData, accountName: e.target.value})}
                        placeholder="e.g. Yosola Schools Ltd"
                    />
                </div>

                <div>
                    <SectionLabel label="Payment Instructions" />
                    <TextAreaField 
                        value={formData.paymentInstructions}
                        onChange={e => setFormData({...formData, paymentInstructions: e.target.value})}
                        placeholder="Additional notes for parents..."
                    />
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all flex items-center gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                    Save Finance Details
                    </button>
                </div>
             </form>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl mb-6">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Change Password</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your current password to authorize this change.</p>
              </div>

              <div className="relative">
                <SectionLabel label="Current Password" />
                <div className="relative">
                    <InputField 
                        type={showCurrentPass ? "text" : "password"} 
                        required 
                        className="pr-10"
                        value={passData.currentPassword} 
                        onChange={e => setPassData({...passData, currentPassword: e.target.value})} 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>

              <div className="relative">
                <SectionLabel label="New Password" />
                <div className="relative">
                    <InputField 
                        type={showNewPass ? "text" : "password"} 
                        required 
                        className="pr-10"
                        value={passData.newPassword} 
                        onChange={e => setPassData({...passData, newPassword: e.target.value})} 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>

              <div>
                <SectionLabel label="Confirm New Password" />
                <InputField 
                    type="password"
                    required
                    value={passData.confirmPassword} 
                    onChange={e => setPassData({...passData, confirmPassword: e.target.value})} 
                />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading}
                    className="w-full bg-slate-900 dark:bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex justify-center items-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Lock className="w-4 h-4"/>}
                    Update Password
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: FRESH LAUNCH & DATA CLEAN */}
          {activeTab === 'launch' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-700" />
                  School Launch & Fresh Database Reset
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  When you are ready to onboard real students and families for Yosola Schools, safely purge all mock/test records with an automated backup.
                </p>
              </div>

              {/* INFORMATION & SAFEGUARDS BANNER */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 text-xs text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300">
                <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Safety Safeguards & What Happens:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/30">
                    <p className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                      ✅ Kept Safe & Intact:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300">
                      <li>Administrator login account</li>
                      <li>School name, bank details, & motto</li>
                      <li>Academic session & term setup</li>
                      <li>Class, Level, & Course structures</li>
                    </ul>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/30">
                    <p className="font-bold text-rose-700 dark:text-rose-400 mb-1">
                      🗑️ Cleaned for Fresh Start:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300">
                      <li>All 242 mock student records</li>
                      <li>All mock parent profiles & logins</li>
                      <li>All test invoices & payment receipts</li>
                      <li>All test attendance & report records</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400/90 italic">
                  💡 A complete pre-clean JSON backup is automatically archived to the <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">backups/</code> folder prior to cleaning.
                </p>
              </div>

              {/* CONFIRMATION FORM */}
              <form onSubmit={handleCleanData} className="space-y-4 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <input
                    type="checkbox"
                    id="includeTeachers"
                    checked={includeTeachers}
                    onChange={(e) => setIncludeTeachers(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <label htmlFor="includeTeachers" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Also purge test teachers (Leave unchecked to keep current teacher staff accounts)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    1. Type <span className="text-rose-600 font-mono select-all">CLEAN TEST DATA</span> to confirm
                  </label>
                  <InputField
                    type="text"
                    required
                    placeholder="CLEAN TEST DATA"
                    value={cleanPhrase}
                    onChange={(e) => setCleanPhrase(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    2. Enter Administrator Password
                  </label>
                  <InputField
                    type="password"
                    required
                    placeholder="Your admin password"
                    value={cleanPassword}
                    onChange={(e) => setCleanPassword(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCleaning || cleanPhrase !== 'CLEAN TEST DATA' || !cleanPassword}
                    className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isCleaning ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    <span>Purge Test Data & Start Fresh</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
