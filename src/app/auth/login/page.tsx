'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); 
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the Auth Hook
      const user = await login(formData.email, formData.password);

      // 2. Check for Forced Reset
      if (user && user.passwordResetRequired) {
        toast.warning("Security Update Required", {
            description: "Please set a new secure password to continue."
        });
        router.push('/auth/new-password'); // <--- THE INTERCEPT
        return;
      }

      // 3. Normal Login
      toast.success("Welcome back", { description: "Accessing secure dashboard..." });
      router.push('/dashboard'); // <--- THE UNIVERSAL ROUTE

    } catch (err: any) {
      console.error(err);
      toast.error("Access Denied", {
        description: err.message || "Invalid credentials."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FDFDFC]">
      
      {/* LEFT PANEL: Brand & Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-900 text-emerald-50">
        {/* Abstract Texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                <Building2 className="w-6 h-6" />
             </div>
             <span className="font-serif text-xl font-bold tracking-tight">Yosola</span>
          </div>

          <div className="max-w-md">
             <h1 className="font-serif text-4xl leading-tight mb-6">
               The operating system for modern education.
             </h1>
             <p className="text-emerald-200/80 text-lg leading-relaxed">
               Manage admissions, academic records, and financial operations from a single, secure ledger.
             </p>
          </div>

          <div className="text-xs text-emerald-400/60 font-mono">
            SECURE SYSTEM • v1.0.4
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          
          <div className="mb-10">
            <h2 className="font-serif text-3xl text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-500">Enter your credentials to access the ledger.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors w-5 h-5" />
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 outline-none transition-all font-medium text-slate-900"
                  placeholder="name@school.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
               <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                 <Link 
  href="/auth/forgot-password" 
  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline" // <--- FIXED TYPO HERE
>
  Forgot password?
</Link>
               </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 outline-none transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-medium py-4 rounded-xl shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Dashboard'} 
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

          </form>

          {/* Quick Demo Links */}
          <div className="mt-8 pt-8 border-t border-slate-100">
             <p className="text-xs text-center text-slate-400 uppercase tracking-widest mb-4">Quick Access</p>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setFormData({email: 'admin@test.com', password: 'password'})} className="px-3 py-2 text-xs font-mono bg-slate-50 hover:bg-emerald-50 text-slate-600 rounded-lg border border-slate-200 transition-colors">
                   Admin
                </button>
                <button onClick={() => setFormData({email: 'parent@test.com', password: 'password'})} className="px-3 py-2 text-xs font-mono bg-slate-50 hover:bg-emerald-50 text-slate-600 rounded-lg border border-slate-200 transition-colors">
                   Parent (Reset)
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
