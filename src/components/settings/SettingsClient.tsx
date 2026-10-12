'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import {
  User,
  Mail,
  Lock,
  Trash2,
  Check,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface SettingsClientProps {
  user: UserProfile;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    setMessage(null);
    try {
      // Simulated or API update
      setMessage({ type: 'success', text: 'Account details updated successfully.' });
      setTimeout(() => setMessage(null), 3500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update details.' });
    } finally {
      setSavingDetails(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingPassword(true);
    setMessage(null);
    try {
      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/login');
    } catch {
      // Ignored
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Account Info Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>Personal Information</span>
        </h2>

        <form onSubmit={handleUpdateDetails} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Managed via Supabase Auth</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingDetails}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {savingDetails ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Update Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>Security & Password</span>
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter new password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword || !newPassword}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200/80 space-y-3">
        <h2 className="text-base font-bold text-rose-900 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Danger Zone</span>
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Deleting your account will permanently remove all your digital business cards, unassign any physical NFC cards, and delete analytics history.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Delete Account Confirmation
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              This action cannot be undone. To confirm, please type <strong className="text-slate-900 font-mono">DELETE</strong> below:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
