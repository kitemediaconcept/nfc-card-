'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  CreditCard,
  Users,
  FileText,
  History,
  Home,
  LogOut,
  Menu,
  X,
  Radio,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface AdminLayoutProps {
  user: UserProfile;
  children: React.ReactNode;
}

export default function AdminLayout({ user, children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Admin Overview', href: '/admin', icon: Layers },
    { name: 'NFC Cards & Minting', href: '/admin/cards', icon: CreditCard },
    { name: 'Customers & Users', href: '/admin/users', icon: Users },
    { name: 'Business Profiles', href: '/admin/profiles', icon: FileText },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  const handleReturnToCustomer = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_switch', demoTarget: 'customer' }),
      });
      router.push('/dashboard');
      router.refresh();
    } catch {
      // Ignored
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            A
          </div>
          <span className="font-bold tracking-tight text-white text-base">SmartNFC Admin</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">Admin Console</div>
              <div className="text-[11px] text-purple-400 font-medium mt-1">Platform Operations</div>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-800/80">
          <div className="text-[11px] text-slate-400">Signed in Administrator:</div>
          <div className="text-xs font-semibold text-white truncate mt-0.5">{user.full_name}</div>
          <div className="text-[11px] text-purple-400 truncate">{user.email}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={handleReturnToCustomer}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer View</span>
          </button>

          <Link
            href="/login"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-900">
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
