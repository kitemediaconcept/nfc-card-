import { requireAuth } from '@/lib/auth';
import SettingsClient from '@/components/settings/SettingsClient';

export default async function AccountSettingsPage() {
  const user = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal credentials, contact email, and account security.
        </p>
      </div>

      <SettingsClient user={user} />
    </div>
  );
}
