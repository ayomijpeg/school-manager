'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setResetLink(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }
      setSent(true);
      if (data.resetLink) setResetLink(data.resetLink);
      toast.success('If an account exists for this email, use the link below to set a new password.');
    } catch (err) {
      toast.error('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FDFDFC]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-900 text-emerald-50">
        <div className="absolute inset-0 opacity-20 bg-[url(https://www.transparenttextures.com/patterns/cubes.png)] mix-blend-overlay" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-serif text-xl font-bold">Yosola</span>
          </div>
          <div className="max-w-md">
            <h1 className="font-serif text-4xl leading-tight mb-6">Reset your password</h1>
            <p className="text-emerald-200/80 text-lg">Enter your account email to get a secure reset link.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700 mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>

          {!sent ? (
            <>
              <div className="mb-8">
                <h2 className="font-serif text-3xl text-slate-900 mb-2">Forgot password?</h2>
                <p className="text-slate-500">Enter your email to get a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 outline-none font-medium text-slate-900"
                      placeholder="name@school.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl text-slate-900 text-center">Check your email</h2>
              <p className="text-slate-500 text-center text-sm">
                If an account exists for <strong className="text-slate-700">{email}</strong>, use the link below. The link expires in 1 hour.
              </p>
              {resetLink && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Reset link</p>
                  <a href={resetLink} className="block text-sm font-medium text-emerald-700 hover:underline break-all">
                    {resetLink}
                  </a>
                </div>
              )}
              <Link href="/auth/login" className="block w-full text-center py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
