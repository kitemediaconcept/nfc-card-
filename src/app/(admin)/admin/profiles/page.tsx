import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import { FileText, ExternalLink, Globe } from 'lucide-react';

export default async function AdminProfilesPage() {
  await requireAdmin();
  const profiles = await DataStore.getAdminProfiles();

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Profiles</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review all customer digital business cards, slugs, themes, and publishing states.
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Name & Title</th>
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Theme</th>
                <th className="py-4 px-6">Public URL</th>
                <th className="py-4 px-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{p.full_name}</div>
                    <div className="text-slate-400 text-[11px]">{p.title || 'No title'}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{p.company_name || '—'}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-purple-400">{p.theme}</td>
                  <td className="py-4 px-6 font-mono text-blue-400">/p/{p.slug}</td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/p/${p.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      <span>Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
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
