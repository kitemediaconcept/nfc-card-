import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import { Users, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await DataStore.getAdminUsers();

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Directory</h1>
        <p className="text-sm text-slate-400 mt-1">
          Registered accounts, roles, contact records, and registration dates.
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Name & ID</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{u.full_name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{u.id}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-purple-400">{u.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{u.phone || '—'}</td>
                  <td className="py-4 px-6 text-slate-400 text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
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
