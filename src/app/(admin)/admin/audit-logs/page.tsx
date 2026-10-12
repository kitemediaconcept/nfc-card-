import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import { History, ShieldAlert } from 'lucide-react';

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const logs = await DataStore.getAdminAuditLogs();

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-1">
          Immutable event records for sensitive administrative operations, card creation, and status transitions.
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Administrator</th>
                <th className="py-4 px-6">Target Resource</th>
                <th className="py-4 px-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-300">
                    {log.admin_email || log.admin_id}
                  </td>
                  <td className="py-4 px-6 font-mono text-blue-400">
                    {log.target_type}: {log.target_id}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
