'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Check, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email and we&apos;ll send you a secure password reset link.
          </p>
        </div>

        {sent ? (
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Reset Link Dispatched</h3>
            <p className="text-xs text-slate-600">
              If an account matches <strong>{email}</strong>, check your inbox for instructions to choose a new password.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@innovatech.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
