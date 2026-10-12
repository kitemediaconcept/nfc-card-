import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import {
  User,
  CreditCard,
  Radio,
  Eye,
  Download,
  ExternalLink,
  Plus,
  ArrowUpRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default async function DashboardOverviewPage() {
  const user = await requireAuth();
  const profiles = await DataStore.getUserProfiles(user.id);
  const cards = await DataStore.getUserCards(user.id);
  const analytics = await DataStore.getAnalytics({ days: 30 });

  const activeCardCount = cards.filter((c) => c.status === 'active').length;
  const primaryProfile = profiles[0] || null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Identity Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your dynamic digital business profiles, physical NFC cards, and visitor engagements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cards/activate"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Activate Card</span>
          </Link>

          <Link
            href="/dashboard/profiles"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Profile</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Profile Views</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.totalViews}</div>
            <div className="text-xs text-slate-400 mt-1">Past 30 days</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">NFC-Link Visits</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.nfcVisits}</div>
            <div className="text-xs text-slate-400 mt-1">Card permanent redirects</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">QR Code Scans</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.qrVisits}</div>
            <div className="text-xs text-slate-400 mt-1">Mobile QR scans</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Save Contacts (.VCF)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{analytics.vcfDownloads}</div>
            <div className="text-xs text-slate-400 mt-1">Saved to phone address book</div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Profiles & Connected NFC Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (2 spans): Business Profiles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My Digital Profiles</h2>
            <Link
              href="/dashboard/profiles"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage all ({profiles.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {profiles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
              <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900">No profile created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Create your first digital business card profile with your contact details, services, and branding.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm"
              >
                <span>Launch Guided Setup</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-lg">
                          {profile.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base truncate">{profile.full_name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            profile.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {profile.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {profile.title || 'No designation'} {profile.company_name ? `• ${profile.company_name}` : ''}
                      </p>
                      <div className="text-[11px] text-blue-600 font-medium mt-1">
                        /p/{profile.slug}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/p/${profile.slug}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live View</span>
                    </Link>
                    <Link
                      href={`/dashboard/profiles/${profile.id}/edit`}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Physical NFC Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Connected NFC Cards</h2>
            <Link
              href="/dashboard/cards"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all ({cards.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Physical Cards</span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                {activeCardCount} Active
              </span>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No NFC cards claimed</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Have a physical card? Claim it with your activation code.
                </p>
                <Link
                  href="/dashboard/cards/activate"
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Activate Physical Card</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.slice(0, 3).map((card) => (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                          {card.card_label || 'Smart NFC Card'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        Assigned: {card.assigned_profile?.full_name || 'Unassigned'}
                      </div>
                    </div>

                    <Link
                      href={`/c/${card.card_token}`}
                      target="_blank"
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Tap URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Zero-replacement URL</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Protected</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
