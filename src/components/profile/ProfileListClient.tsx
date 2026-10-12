'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BusinessProfileData } from '@/types';
import { Plus, User, ExternalLink, Edit3, Trash2, Copy, Check, Sparkles } from 'lucide-react';

interface ProfileListClientProps {
  initialProfiles: BusinessProfileData[];
}

export default function ProfileListClient({ initialProfiles }: ProfileListClientProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<BusinessProfileData[]>(initialProfiles);
  const [creating, setCreating] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newFullName.trim(),
          title: newTitle.trim(),
          status: 'draft',
        }),
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        setShowModal(false);
        router.push(`/dashboard/profiles/${data.profile.id}/edit`);
      }
    } catch {
      // Ignored
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete profile "${name}"? Any linked NFC cards will be unassigned.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    } catch {
      // Ignored
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Total Profiles ({profiles.length})
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Profile</span>
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">No Profiles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Get started by creating your first digital business card profile.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
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
                <div className="min-w-0 flex-1">
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
                    {profile.title || 'No title set'} {profile.company_name ? `• ${profile.company_name}` : ''}
                  </p>
                  <div className="text-[11px] text-blue-600 font-semibold mt-1">
                    /p/{profile.slug}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(profile.slug, profile.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Copy Profile URL"
                  >
                    {copiedId === profile.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === profile.id ? 'Copied' : 'Link'}</span>
                  </button>

                  <Link
                    href={`/p/${profile.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/profiles/${profile.id}/edit`}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(profile.id, profile.full_name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Business Profile</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter basic details to initialize your profile. You can customize full design and links in the editor.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Designation
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Managing Director"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create & Open Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
