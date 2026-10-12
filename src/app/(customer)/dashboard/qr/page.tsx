import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import QrManagerClient from '@/components/qr/QrManagerClient';

export default async function QrSharingPage() {
  const user = await requireAuth();
  const profiles = await DataStore.getUserProfiles(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Codes & Sharing</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate high-resolution SVG and PNG QR codes to print on brochures, flyers, or display on mobile screens.
          </p>
        </div>
      </div>

      <QrManagerClient profiles={profiles} />
    </div>
  );
}
