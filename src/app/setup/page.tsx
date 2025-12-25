'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  BookOpen, 
  School, 
  CheckCircle2, 
  ArrowRight, 
  Building2,
  CalendarRange
} from 'lucide-react';
import Button from '@/components/ui/Button';

// --- Types ---
type SchoolTypeClient = 'BASIC' | 'TERTIARY';

type SetupFormData = {
  schoolName: string;
  motto: string;
  schoolType: SchoolTypeClient;
  academicYear: string;
  offersNursery: boolean;
  offersPrimary: boolean;
  offersSecondary: boolean;
};

// --- Animations (Slide Effect you liked) ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.99,
  }),
};

export default function SchoolSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<SetupFormData>({
    schoolName: '',
    motto: '',
    schoolType: 'BASIC',
    academicYear: '2024/2025',
    offersNursery: false,
    offersPrimary: true,
    offersSecondary: true,
  });

  const nextStep = () => { setDirection(1); setStep((prev) => prev + 1); };
  const prevStep = () => { setDirection(-1); setStep((prev) => prev - 1); };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/setup/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed');

      toast.success('Institution established successfully.');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || 'Configuration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFDFC] text-slate-800">
      
      <div className="w-full max-w-2xl z-10">
        
        {/* --- HEADER (Restored from Version 1) --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-emerald-900 text-emerald-50 shadow-xl shadow-emerald-900/20">
            <School className="w-7 h-7" />
          </div>
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-800 mb-2">
            System Configuration
          </h2>
          <div className="h-1 w-12 bg-emerald-800/10 mx-auto rounded-full" />
        </motion.div>

        {/* --- MAIN CARD AREA --- */}
        <div className="relative min-h-[550px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-8 sm:p-12">
                  <div className="mb-8">
                    <h1 className="text-3xl font-serif text-slate-900 mb-2">Establish Identity</h1>
                    <p className="text-slate-500">Naming the institution creates the root record.</p>
                  </div>

                  <div className="space-y-6">
                    {/* HIGH VISIBILITY INPUTS (Boxed Style) */}
                    <BoxInput 
                      label="Official School Name"
                      placeholder="e.g. Cambridge High School"
                      value={formData.schoolName}
                      onChange={(e: any) => setFormData({ ...formData, schoolName: e.target.value })}
                      icon={Building2}
                      autoFocus
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <BoxInput 
                        label="Motto (Optional)"
                        placeholder="Excellence..."
                        value={formData.motto}
                        onChange={(e: any) => setFormData({ ...formData, motto: e.target.value })}
                      />
                      <BoxInput 
                        label="Academic Session"
                        placeholder="YYYY/YYYY"
                        value={formData.academicYear}
                        onChange={(e: any) => setFormData({ ...formData, academicYear: e.target.value })}
                        icon={CalendarRange}
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <Button 
                      variant="primary" 
                      onClick={nextStep}
                      disabled={!formData.schoolName || !formData.academicYear}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-8 h-12"
                    >
                      Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: STRUCTURE */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-8 sm:p-12">
                  <div className="mb-8">
                    <h1 className="text-3xl font-serif text-slate-900 mb-2">Structure</h1>
                    <p className="text-slate-500">Define the academic model.</p>
                  </div>

                  {/* HIGH VISIBILITY SELECTION CARDS */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <SelectionCard 
                      selected={formData.schoolType === 'BASIC'}
                      onClick={() => setFormData({ ...formData, schoolType: 'BASIC' })}
                      icon={BookOpen}
                      title="Basic Education"
                      desc="K-12, Nursery, Primary & Secondary"
                    />
                    <SelectionCard 
                      selected={formData.schoolType === 'TERTIARY'}
                      onClick={() => setFormData({ ...formData, schoolType: 'TERTIARY' })}
                      icon={GraduationCap}
                      title="Tertiary"
                      desc="University, Poly & Colleges"
                    />
                  </div>

                  {formData.schoolType === 'BASIC' && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Active Sections
                      </p>
                      <div className="space-y-3">
                        <CheckboxRow 
                          checked={formData.offersNursery} 
                          onChange={(v: boolean) => setFormData({...formData, offersNursery: v})} 
                          label="Early Years & Nursery"
                        />
                        <CheckboxRow 
                          checked={formData.offersPrimary} 
                          onChange={(v: boolean) => setFormData({...formData, offersPrimary: v})} 
                          label="Primary Section"
                        />
                        <CheckboxRow 
                          checked={formData.offersSecondary} 
                          onChange={(v: boolean) => setFormData({...formData, offersSecondary: v})} 
                          label="Secondary Section"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-10 flex justify-between items-center">
                    <button onClick={prevStep} className="text-sm font-medium text-slate-400 hover:text-emerald-800 transition-colors">
                      Back
                    </button>
                    <Button 
                      variant="primary" 
                      onClick={nextStep}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-8 h-12"
                    >
                      Review <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-8 sm:p-12 text-center">
                  
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h1 className="text-3xl font-serif text-slate-900 mb-2">Confirmation</h1>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                    Please verify the details below before initializing the database.
                  </p>

                  {/* THE RECEIPT CARD (From V2) */}
                  <div className="bg-[#FFFDF5] border border-stone-200 p-6 rounded-xl shadow-sm text-left mb-8 relative max-w-sm mx-auto">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600/20 bg-[linear-gradient(90deg,transparent_50%,#fff_50%)] bg-[length:10px_10px]" />
                    <div className="space-y-4 font-mono text-sm text-slate-600">
                      <div>
                        <span className="block text-[10px] text-stone-400 font-sans font-bold uppercase tracking-widest">Institution</span>
                        <span className="block font-serif text-lg text-slate-900 font-bold">{formData.schoolName}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span>TYPE</span>
                        <span className="font-bold text-slate-900">{formData.schoolType}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-200 pb-2">
                        <span>SESSION</span>
                        <span className="font-bold text-slate-900">{formData.academicYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CURRENCY</span>
                        <span className="font-bold text-slate-900">NGN (₦)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    <Button 
                      variant="primary" 
                      onClick={handleFinish}
                      isLoading={isLoading}
                      className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl py-4 h-auto text-lg shadow-xl shadow-emerald-900/10"
                    >
                      {isLoading ? 'Initializing...' : 'Launch System'}
                    </Button>
                    <button 
                      onClick={prevStep}
                      disabled={isLoading} 
                      className="text-sm text-slate-400 hover:text-emerald-800 py-2"
                    >
                      Make Adjustments
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* --- FOOTER (Restored from Version 1) --- */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2 z-0">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-emerald-800' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

// --- Components (High Visibility Styling) ---

const BoxInput = ({ label, value, onChange, placeholder, icon: Icon, autoFocus }: any) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
          <Icon size={20} />
        </div>
      )}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-sm ${
          Icon ? 'pl-11 pr-4' : 'px-4'
        }`}
      />
    </div>
  </div>
);

const SelectionCard = ({ selected, onClick, icon: Icon, title, desc }: any) => (
  <button
    onClick={onClick}
    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative group overflow-hidden ${
      selected
        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
        : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
      selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'
    }`}>
      <Icon size={20} />
    </div>
    <h3 className={`font-serif font-bold mb-1 ${selected ? 'text-emerald-900' : 'text-slate-800'}`}>
      {title}
    </h3>
    <p className="text-xs text-slate-500 leading-relaxed">
      {desc}
    </p>
    {selected && <div className="absolute top-3 right-3 text-emerald-600"><CheckCircle2 size={18} /></div>}
  </button>
);

const CheckboxRow = ({ checked, onChange, label }: any) => (
  <label className="flex items-center gap-3 p-3 rounded-xl border border-transparent bg-white hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group">
    <div 
      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
        checked ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300 group-hover:border-emerald-400'
      }`}
    >
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
    </div>
    <span className={`text-sm font-medium ${checked ? 'text-slate-900' : 'text-slate-600'}`}>
      {label}
    </span>
  </label>
);
