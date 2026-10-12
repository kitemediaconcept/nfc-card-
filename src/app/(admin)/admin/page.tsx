import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import {
  Users,
  CreditCard,
  FileText,
  Radio,
  QrCode,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  await requireAdmin();
  const stats = await DataStore.getAdminStats();
  const recentLogs = await DataStore.getAdminAuditLogs();

  return (
    <div className="space-y-8">
      {/* Admin Welcome Banner */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Administrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Platform System Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global monitoring for NFC card batches, customer accounts, digital profiles, and security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cards"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Mint NFC Cards</span>
          </Link>
        </div>
      </div>

      {/* Global Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
          <p className="text-xs text-slate-400 mt-1">Registered accounts</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Physical Cards</span>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalCards}</div>
          <p className="text-xs text-emerald-400 mt-1">{stats.activeCards} currently active</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Business Profiles</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalProfiles}</div>
          <p className="text-xs text-slate-400 mt-1">{stats.publishedProfiles} published live</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Scans</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalScans}</div>
          <p className="text-xs text-slate-400 mt-1">{stats.totalNfcVisits} NFC visits • {stats.totalQrVisits} QR</p>
        </div>
      </div>

      {/* Card Status Breakdown Bar */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-white uppercase tracking-wider">Card Inventory Allocation</span>
          <Link href="/admin/cards" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
            <span>Manage Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xl font-bold text-emerald-400">{stats.activeCards}</div>
            <div className="text-xs text-slate-400 mt-0.5">Active & Claimed</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xl font-bold text-blue-400">{stats.unclaimedCards}</div>
            <div className="text-xs text-slate-400 mt-0.5">Unclaimed / Available</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xl font-bold text-rose-400">{stats.disabledCards}</div>
            <div className="text-xs text-slate-400 mt-0.5">Disabled / Inactive</div>
          </div>
        </div>
      </div>

      {/* Recent Admin Audit Logs */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Recent Security Audit Logs</h2>
          <Link href="/admin/audit-logs" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
            View All Logs
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {recentLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-purple-300 uppercase tracking-wider mr-2">
                  {log.action.replace('_', ' ')}
                </span>
                <span className="text-slate-400">
                  Target: <strong className="text-slate-200">{log.target_type} ({log.target_id})</strong>
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
