'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset link.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to set new password.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      toast.success('Password updated. Redirecting to sign in...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    } catch (err) {
      toast.error('Request failed. Please try again.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <p className="text-slate-600 mb-4">This reset link is invalid or has expired.</p>
        <Link href="/auth/forgot-password" className="text-emerald-700 font-medium hover:underline">
          Request a new link
        </Link>
        <span className="text-slate-400 mx-2">or</span>
        <Link href="/auth/login" className="text-emerald-700 font-medium hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-[400px] text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl text-slate-900">Password updated</h2>
        <p className="text-slate-500">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-slate-900 mb-2">Set new password</h2>
        <p className="text-slate-500">Enter and confirm your new password.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 outline-none font-medium text-slate-900"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 outline-none font-medium text-slate-900"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-[#FDFDFC]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-900 text-emerald-50">
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-serif text-xl font-bold">Yosola</span>
          </div>
          <div className="max-w-md">
            <h1 className="font-serif text-4xl leading-tight mb-6">Set a new password</h1>
            <p className="text-emerald-200/80 text-lg">Choose a strong password to secure your account.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
