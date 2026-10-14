'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Sparkles, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      } else {
        // Fallback demo switch if Supabase is offline
        await handleDemoLogin('customer');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Social sign-in failed';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f3] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#484640]/10 shadow-[0_20px_50px_rgba(84,66,54,0.08)]">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-[#995b40] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#995b40]/25">
              N
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-[#484640] tracking-tight">Sign In to SmartNFC</h1>
          <p className="text-xs text-[#89817b] mt-1">
            Access your dynamic profile hub, physical cards, and scan analytics
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        {/* Social Authentication Buttons */}
        <div className="space-y-2.5 mb-5">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#484640]/15 hover:bg-[#faf7f3] text-[#484640] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#484640]/15 hover:bg-[#faf7f3] text-[#484640] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 fill-current text-[#484640]" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-[#484640]/10"></div>
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#89817b] uppercase tracking-wider">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-[#484640]/10"></div>
        </div>

        {/* Quick Demo Login Helpers */}
        <div className="mb-5 p-3 rounded-2xl bg-[#f3ddd6]/40 border border-[#e8bdb0] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#995b40]">
            <Sparkles className="w-3.5 h-3.5 text-[#995b40]" />
            <span>Instant Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-[#faf7f3] border border-[#e8bdb0] text-[#995b40] text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-[#484640] hover:bg-[#383632] text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#d5c5ac]" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#484640] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#89817b] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@innovatech.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-[#484640]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#995b40] hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#89817b] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#995b40] hover:bg-[#814a33] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#995b40]/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Signing In...' : 'Sign In with Email'}</span>
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
