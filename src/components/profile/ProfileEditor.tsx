'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BusinessProfileData,
  SocialLink,
  CustomField,
  ServiceItem,
  PortfolioItem,
  ThemeId,
} from '@/types';
import PublicProfileCard from '@/components/card/PublicProfileCard';
import {
  Save,
  Send,
  Eye,
  Smartphone,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  Building2,
  Palette,
  Layers,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';

interface ProfileEditorProps {
  initialProfile: BusinessProfileData;
}

const THEME_OPTIONS: Array<{ id: ThemeId; name: string; previewColor: string }> = [
  { id: 'modern-navy', name: 'Modern Navy', previewColor: '#1e3a8a' },
  { id: 'sleek-dark', name: 'Sleek Dark', previewColor: '#18181b' },
  { id: 'emerald-luxury', name: 'Emerald Luxury', previewColor: '#064e3b' },
  { id: 'royal-amethyst', name: 'Royal Amethyst', previewColor: '#581c87' },
  { id: 'sunset-amber', name: 'Sunset Amber', previewColor: '#78350f' },
  { id: 'minimal-light', name: 'Minimal Light', previewColor: '#f8fafc' },
];

export default function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfileData>(initialProfile);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field change helpers
  const updateField = <K extends keyof BusinessProfileData>(key: K, value: BusinessProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  // Image Upload helper (supports URL or local file read as data URL)
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, key: 'avatar_url' | 'cover_url' | 'company_logo_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField(key, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Social Links management
  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: 'linkedin',
      label: 'LinkedIn',
      url: '',
    };
    updateField('social_links', [...(profile.social_links || []), newLink]);
  };

  const removeSocialLink = (id: string) => {
    updateField('social_links', (profile.social_links || []).filter((l) => l.id !== id));
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    updateField(
      'social_links',
      (profile.social_links || []).map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  // Services management
  const addService = () => {
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      title: 'Consulting Session',
      description: 'Strategic advisory and execution roadmap.',
      price: '$150 / hr',
    };
    updateField('services', [...(profile.services || []), newService]);
  };

  const removeService = (id: string) => {
    updateField('services', (profile.services || []).filter((s) => s.id !== id));
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    updateField(
      'services',
      (profile.services || []).map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Portfolio management
  const addPortfolio = () => {
    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: 'New Project Showcase',
      description: 'Brief overview of key deliverables and impact.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    };
    updateField('portfolio', [...(profile.portfolio || []), newItem]);
  };

  const removePortfolio = (id: string) => {
    updateField('portfolio', (profile.portfolio || []).filter((p) => p.id !== id));
  };

  const updatePortfolio = (id: string, updates: Partial<PortfolioItem>) => {
    updateField(
      'portfolio',
      (profile.portfolio || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  // Custom Fields
  const addCustomField = () => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      label: 'Office Hours',
      value: 'Mon - Fri, 9am - 5pm EST',
    };
    updateField('custom_fields', [...(profile.custom_fields || []), newField]);
  };

  const removeCustomField = (id: string) => {
    updateField('custom_fields', (profile.custom_fields || []).filter((f) => f.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    updateField(
      'custom_fields',
      (profile.custom_fields || []).map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  // Save / Publish Action
  const handleSave = async (isPublish: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (isPublish) setPublishing(true);
    else setSavingDraft(true);

    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: profile,
          isPublish,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes.');
      }

      setProfile(data.profile);
      setSuccessMessage(
        isPublish
          ? 'Profile published live! Visitors and NFC card taps will see your updates immediately.'
          : 'Draft saved privately.'
      );
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(msg);
    } finally {
      setSavingDraft(false);
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Save Actions Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Edit Business Profile
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                profile.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {profile.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent URL:{' '}
            <a
              href={`/p/${profile.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span>/p/{profile.slug}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Form Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Live Phone</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSave(false)}
            disabled={savingDraft || publishing}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={savingDraft || publishing}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{publishing ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Split View Layout: Left Form Fields | Right Live Mobile Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM SECTIONS */}
        <div
          className={`space-y-6 ${
            activeTab === 'preview' ? 'hidden lg:block lg:col-span-7' : 'lg:col-span-7'
          }`}
        >
          {/* Section 1: Basic Identity & Branding */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Identity & Branding</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Alex Rivera"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profile Username / URL Slug
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 bg-slate-50 text-slate-400 text-xs font-medium border-r border-slate-200">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={profile.slug}
                    onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="my-profile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Job Title
                </label>
                <input
                  type="text"
                  value={profile.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. VP of Product Engineering"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={profile.company_name || ''}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. InnovaTech Solutions"
                />
              </div>
            </div>

            {/* Profile Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Photo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, 'avatar_url')}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e, 'cover_url')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e, 'company_logo_url')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                About / Bio Description
              </label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your background, passions, or company mission..."
              />
            </div>
          </div>

          {/* Section 2: Direct Contact & Visibility Controls */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Direct Contact & Visibility</span>
            </h2>

            <div className="space-y-3">
              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="pt-5 flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={profile.phone_visible}
                      onChange={(e) => updateField('phone_visible', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={profile.whatsapp || ''}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="pt-5 flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={profile.whatsapp_visible}
                      onChange={(e) => updateField('whatsapp_visible', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="alex@company.com"
                  />
                </div>
                <div className="pt-5 flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={profile.email_visible}
                      onChange={(e) => updateField('email_visible', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://company.com"
                  />
                </div>
                <div className="pt-5 flex items-center gap-2">
                  <label className="text-xs text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={profile.website_visible}
                      onChange={(e) => updateField('website_visible', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address & Map Location */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Office Location</span>
              </h2>
              <label className="text-xs text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={profile.address_visible}
                  onChange={(e) => updateField('address_visible', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Show Address on Card</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={profile.street || ''}
                  onChange={(e) => updateField('street', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="550 Montgomery St, Suite 800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={profile.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={profile.postal_code || ''}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="94111"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country || ''}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United States"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Google Maps Link</label>
                <input
                  type="url"
                  value={profile.maps_url || ''}
                  onChange={(e) => updateField('maps_url', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Theme & Visual Styling */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Card Theme & Color</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_OPTIONS.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => updateField('theme', th.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    profile.theme === th.id
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: th.previewColor }}
                  />
                  <span className="text-xs font-semibold text-slate-800">{th.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Social Media Links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Social Links ({profile.social_links?.length || 0})</span>
              </h2>
              <button
                type="button"
                onClick={addSocialLink}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {(profile.social_links || []).map((link) => (
                <div key={link.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(link.id, { platform: e.target.value as any, label: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="instagram">Instagram</option>
                    <option value="github">GitHub</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="website">Custom Link</option>
                  </select>

                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Services & Products */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Services & Offerings ({profile.services?.length || 0})</span>
              </h2>
              <button
                type="button"
                onClick={addService}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-3">
              {(profile.services || []).map((srv) => (
                <div key={srv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => updateService(srv.id, { title: e.target.value })}
                      placeholder="Service Title"
                      className="flex-1 font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      value={srv.price || ''}
                      onChange={(e) => updateService(srv.id, { price: e.target.value })}
                      placeholder="Pricing (e.g. $150/hr)"
                      className="w-32 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeService(srv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={srv.description || ''}
                    onChange={(e) => updateService(srv.id, { description: e.target.value })}
                    placeholder="Brief description of the service..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                  />
                  <input
                    type="url"
                    value={srv.link_url || ''}
                    onChange={(e) => updateService(srv.id, { link_url: e.target.value })}
                    placeholder="Booking or Information URL (optional)"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Portfolio Highlights */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Featured Projects & Portfolio</span>
              </h2>
              <button
                type="button"
                onClick={addPortfolio}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {(profile.portfolio || []).map((port) => (
                <div key={port.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={port.title}
                      onChange={(e) => updatePortfolio(port.id, { title: e.target.value })}
                      placeholder="Project Title"
                      className="flex-1 font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolio(port.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={port.description || ''}
                    onChange={(e) => updatePortfolio(port.id, { description: e.target.value })}
                    placeholder="Short description of your contribution..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={port.image_url || ''}
                      onChange={(e) => updatePortfolio(port.id, { image_url: e.target.value })}
                      placeholder="Image URL"
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                    />
                    <input
                      type="url"
                      value={port.project_url || ''}
                      onChange={(e) => updatePortfolio(port.id, { project_url: e.target.value })}
                      placeholder="Case Study / Live URL"
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 8: Custom Fields */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Custom Label & Value Fields</span>
              </h2>
              <button
                type="button"
                onClick={addCustomField}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-3">
              {(profile.custom_fields || []).map((cf) => (
                <div key={cf.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={cf.label}
                    onChange={(e) => updateCustomField(cf.id, { label: e.target.value })}
                    placeholder="Label (e.g. License)"
                    className="w-36 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-medium"
                  />
                  <input
                    type="text"
                    value={cf.value}
                    onChange={(e) => updateCustomField(cf.id, { value: e.target.value })}
                    placeholder="Value (e.g. AWS Certified)"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomField(cf.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PHONE PREVIEW */}
        <div
          className={`lg:col-span-5 sticky top-28 ${
            activeTab === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-slate-900/5 p-4 rounded-3xl border border-slate-200/80 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3 px-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Live Phone Preview</span>
              </span>
              <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Instant Updates
              </span>
            </div>

            {/* Mobile frame mockup */}
            <div className="w-full max-w-[360px] bg-slate-900 rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-800">
              {/* Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2" />
              {/* Screen viewport */}
              <div className="h-[620px] overflow-y-auto rounded-[32px] bg-slate-950">
                <PublicProfileCard profile={profile} isPreview={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
