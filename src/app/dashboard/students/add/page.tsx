'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  User, 
  Calendar, 
  BookOpen, 
  Building2, 
  Phone, 
  Mail, 
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { SchoolType } from '@prisma/client';

// --- Types ---
type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  contactPhone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  levelId: string;
  departmentId: string; // Only used for Tertiary
};

type ReferenceData = {
  levels: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  schoolType: SchoolType;
};

export default function AdmissionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Dynamic Data from DB
  const [refData, setRefData] = useState<ReferenceData>({
    levels: [],
    departments: [],
    schoolType: 'BASIC', // Default
  });

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    contactPhone: '',
    dateOfBirth: '',
    gender: 'MALE',
    levelId: '',
    departmentId: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        // PARALLEL FETCHING: Get Config, Levels, and Departments at once
        const [configRes, levelsRes, deptsRes] = await Promise.all([
           // We check the setup status to know if it's Tertiary or Basic
           fetch('/api/setup/school').then(r => r.json()), 
           
           // Fetch the list we just created
           fetch('/api/levels').then(r => r.json()),
           
           // Fetch the departments
           fetch('/api/departments').then(r => r.json())
        ]);

        setRefData({
          // Safely handle if the API returns { error: ... } or empty arrays
          levels: Array.isArray(levelsRes) ? levelsRes : [],
          departments: Array.isArray(deptsRes) ? deptsRes : [],
          schoolType: configRes?.config?.schoolType || 'BASIC' // Check how your setup API returns data
        });
      } catch (e) {
        console.error("Failed to load form data", e);
        toast.error("Could not load form options");
      } finally {
        setIsFetching(false);
      }
    }
    
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
      try{
     const payload = {
        ...formData,
        departmentId: formData.departmentId || undefined, // Fixes the UUID error
        email: formData.email || undefined,               // Fixes "Invalid email" if empty
        contactPhone: formData.contactPhone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Send the clean payload
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Log the specific error to console for debugging
        console.error("Validation Errors:", data);
        throw new Error(data.error || 'Admission failed');
      }

      toast.success(`Student Admitted! Matric: ${data.matricNumber}`);
      router.push('/dashboard/students'); 
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isTertiary = refData.schoolType === 'TERTIARY';

  if (isFetching) {
    return (
        <div className="h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif text-slate-900 mb-2">New Student Admission</h1>
        <p className="text-slate-500">
          Enter the student&apos;s  details to generate their matriculation number and profile.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: PERSONAL INFO */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="First Name" 
              value={formData.firstName}
              onChange={(v) => setFormData({...formData, firstName: v})}
              placeholder="e.g. Daniel"
            />
            <Input 
              label="Last Name" 
              value={formData.lastName}
              onChange={(v) => setFormData({...formData, lastName: v})}
              placeholder="e.g. Okafor"
            />
            
            {/* Gender Select */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Gender</label>
                <div className="flex gap-4">
                    {['MALE', 'FEMALE'].map((g) => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({...formData, gender: g as any})}
                            className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${
                                formData.gender === g 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <Input 
              label="Date of Birth" 
              type="date"
              value={formData.dateOfBirth}
              onChange={(v) => setFormData({...formData, dateOfBirth: v})}
            />
          </div>
        </Section>

        {/* SECTION 2: ACADEMIC PLACEMENT (SMART LOGIC HERE) */}
        <Section title="Academic Placement" icon={BookOpen}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Level Selector (Always Visible) */}
            <Select 
                label={isTertiary ? "Level / Year" : "Class Level"}
                value={formData.levelId}
                onChange={(v) => setFormData({...formData, levelId: v})}
            >
                <option value="">Select Level...</option>
                {refData.levels.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                ))}
            </Select>

            {/* 2. Department Selector (Tertiary Only OR Secondary Senior) */}
            {/* If Basic, we might show this if they have Departments (like Science/Arts) */}
            {refData.departments.length > 0 && (
                 <Select 
                    label={isTertiary ? "Department / Major" : "Department (Optional)"}
                    value={formData.departmentId}
                    onChange={(v) => setFormData({...formData, departmentId: v})}
                >
                    <option value="">Select Department...</option>
                    {refData.departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </Select>
            )}

          </div>
        </Section>

        {/* SECTION 3: CONTACT */}
        <Section title="Contact Details" icon={Phone}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
                label="Email Address (Optional)" 
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({...formData, email: v})}
                placeholder="student@example.com"
            />
            <Input 
                label="Phone Number" 
                type="tel"
                value={formData.contactPhone}
                onChange={(v) => setFormData({...formData, contactPhone: v})}
                placeholder="+234..."
            />
           </div>
        </Section>

        <div className="flex justify-end pt-4">
            <Button 
                variant="primary" 
                className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-8 h-12 shadow-xl shadow-emerald-900/10"
                isLoading={isLoading}
            >
                Admit Student <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
        </div>

      </form>
    </div>
  );
}

// --- Local UI Components (Ivy & Ink Style) ---

const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-emerald-800">
                <Icon size={20} />
            </div>
            <h2 className="text-lg font-serif font-bold text-slate-800">{title}</h2>
        </div>
        {children}
    </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
    </div>
);

const Select = ({ label, value, onChange, children }: any) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">{label}</label>
        <div className="relative">
            <select
                 title="select Option"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none"
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
        </div>
    </div>
);
