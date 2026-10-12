'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CreditCard,
  User,
  Sparkles,
  QrCode,
  BarChart3,
  Settings,
  Layers,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface DashboardLayoutProps {
  user: UserProfile;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingUser, setSwitchingUser] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Layers },
    { name: 'My Profiles', href: '/dashboard/profiles', icon: User },
    { name: 'My NFC Cards', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Activate Card', href: '/dashboard/cards/activate', icon: Radio },
    { name: 'QR Codes & Sharing', href: '/dashboard/qr', icon: QrCode },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSwitchRole = async (target: 'admin' | 'customer') => {
    setSwitchingUser(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_switch', demoTarget: target }),
      });
      if (target === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      // Ignored
    } finally {
      setSwitchingUser(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/login');
      router.refresh();
    } catch {
      // Ignored
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            N
          </div>
          <span className="font-bold tracking-tight text-slate-900 text-base">SmartNFC</span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-500/25">
              N
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">SmartNFC</div>
              <div className="text-[11px] text-blue-400 font-medium mt-1">Digital Business Hub</div>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Switcher Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Active Account:</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>

            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center gap-2">
              <button
                onClick={() => handleSwitchRole(user.role === 'admin' ? 'customer' : 'admin')}
                disabled={switchingUser}
                className="w-full py-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-medium transition-colors text-center"
              >
                {user.role === 'admin' ? 'Switch to Customer' : 'Switch to Admin View'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {user.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Administration
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </Link>
            </div>
          )}
        </nav>

        {/* External NFC Hardware writing help link & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <Link
            href="/c/tap-rivera-8821"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Live NFC URL</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
