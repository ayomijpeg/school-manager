'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Save, Loader2, ShieldCheck, Eye, EyeOff, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  
  // State for Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  // State for UI toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch current user email on mount to pre-fill the field
  useEffect(() => {
    async function getInitialEmail() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setEmail(data.user.email || '');
        }
      } catch (error) {
        console.error("Failed to fetch initial user data", error);
      } finally {
        setFetchingUser(false);
      }
    }
    getInitialEmail();
  }, []);

  const isSystemEmail = email.includes('@yosola.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password is too short (min 6 chars)");
      return;
    }
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newPassword: password,
          email: email.toLowerCase().trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success("Account Setup Complete", { 
        description: "Your login details have been updated.",
        duration: 3000,
      });
      
      setTimeout(() => {
         window.location.href = '/dashboard'; 
      }, 1500);
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Update Failed", { description: message });
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-8 animate-in zoom-in-95 duration-300">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 ring-4 ring-amber-50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Finalize Account Setup</h1>
          <p className="text-slate-500 text-sm mt-2">
            Please update your login email and set a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSystemEmail ? "Update Your Email" : "Login Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${
                  isSystemEmail 
                    ? 'bg-amber-50 border-amber-200 focus:ring-amber-500/20 focus:border-amber-500' 
                    : 'bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {isSystemEmail ? (
              <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> This is a temporary ID. Please change it to your real email.
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">This will be your permanent login ID.</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type={showConfirm ? "text" : "password"} 
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
