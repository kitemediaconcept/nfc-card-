'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Sparkles, ShieldAlert, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (target: 'customer' | 'admin') => {
    setLoading(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_switch', demoTarget: target }),
      });
      if (target === 'admin') router.push('/admin');
      else router.push('/dashboard');
      router.refresh();
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md mx-auto mb-3">
            N
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to SmartNFC</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your digital profile hub and physical NFC cards
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium mb-4">
            {error}
          </div>
        )}

        {/* Quick Demo Login Helpers */}
        <div className="mb-6 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Instant Pair-Testing Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-blue-800 text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
