'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, ThemeId } from '@/types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  Building2,
  Phone,
  Mail,
  Palette,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingClientProps {
  user: UserProfile;
}

export default function OnboardingClient({ user }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user.full_name);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState(
    user.full_name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mycard'
  );

  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email);
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');

  const [theme, setTheme] = useState<ThemeId>('modern-navy');
  const [creating, setCreating] = useState(false);

  const handleFinish = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          title,
          company_name: companyName,
          slug,
          phone,
          email,
          website,
          city,
          theme,
          status: 'published',
        }),
      });

      const data = await res.json();
      if (res.ok && data.profile) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignored
        }
        router.push(`/dashboard/profiles/${data.profile.id}/edit`);
      }
    } catch {
      // Ignored
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Step {step} of 3
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            {step === 1 && 'Create Your Digital Identity'}
            {step === 2 && 'Contact & Coordinates'}
            {step === 3 && 'Choose Card Styling'}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-7 h-2 rounded-full transition-all ${
                s <= step ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (slug === 'mycard' || slug === '') {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                }
              }}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title / Designation
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Founder & Chief Architect"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. InnovaTech Labs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Choose Public URL Slug <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <span className="px-3 bg-slate-50 text-slate-400 text-xs font-medium border-r border-slate-200">
                yourdomain.com/p/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This will be your permanent shareable web address.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={!fullName.trim() || !slug.trim()}
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@innovatech.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://innovatech.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / Location
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Starting Aesthetic Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'modern-navy', name: 'Modern Navy', hex: '#1e3a8a' },
                { id: 'sleek-dark', name: 'Sleek Dark', hex: '#18181b' },
                { id: 'emerald-luxury', name: 'Emerald Luxury', hex: '#064e3b' },
                { id: 'royal-amethyst', name: 'Royal Amethyst', hex: '#581c87' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id as ThemeId)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    theme === th.id
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: th.hex }}
                  />
                  <span className="text-xs font-semibold text-slate-800">{th.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
            <p className="font-bold">Ready to Launch!</p>
            <p className="text-blue-800/80 leading-relaxed">
              We&apos;ll generate your live business card at <strong>/p/{slug}</strong>. You can customize photos, social links, and activate physical NFC cards anytime.
            </p>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={creating}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{creating ? 'Creating Profile...' : 'Complete Setup & Open Card'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
