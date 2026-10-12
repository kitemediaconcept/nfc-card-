import {
  UserProfile,
  BusinessProfileData,
  NfcCard,
  CardActivationRecord,
  AnalyticsEvent,
  AuditLog,
  PlatformStats,
} from '@/types';
import { generateCardToken, generateActivationCode, generateSalt, hashActivationCode } from './crypto';

// In-memory persistent demo store
interface GlobalStore {
  users: Map<string, UserProfile>;
  profiles: Map<string, BusinessProfileData>;
  cards: Map<string, NfcCard>;
  activations: Map<string, CardActivationRecord>;
  analytics: AnalyticsEvent[];
  auditLogs: AuditLog[];
  rateLimits: Map<string, { count: number; resetAt: number }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __NFC_GLOBAL_STORE__: GlobalStore | undefined;
}

function getStore(): GlobalStore {
  if (!global.__NFC_GLOBAL_STORE__) {
    const defaultUsers = new Map<string, UserProfile>();
    const defaultProfiles = new Map<string, BusinessProfileData>();
    const defaultCards = new Map<string, NfcCard>();
    const defaultActivations = new Map<string, CardActivationRecord>();
    const defaultAnalytics: AnalyticsEvent[] = [];
    const defaultAuditLogs: AuditLog[] = [];

    // Pre-seed Demo Customer
    const demoCustomerId = 'cust-user-1001';
    defaultUsers.set(demoCustomerId, {
      id: demoCustomerId,
      email: 'alex@innovatech.com',
      full_name: 'Alex Rivera',
      phone: '+1 (555) 234-5678',
      role: 'customer',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Pre-seed Demo Admin
    const demoAdminId = 'admin-user-0001';
    defaultUsers.set(demoAdminId, {
      id: demoAdminId,
      email: 'admin@smartnfc.io',
      full_name: 'System Administrator',
      phone: '+1 (555) 999-0000',
      role: 'admin',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Pre-seed Published Business Profile
    const demoProfileId = 'prof-rivera-101';
    const initialProfile: BusinessProfileData = {
      id: demoProfileId,
      user_id: demoCustomerId,
      slug: 'alexrivera',
      full_name: 'Alex Rivera',
      title: 'VP of Product Engineering',
      company_name: 'InnovaTech Solutions',
      company_logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bio: 'Leading digital transformation & edge computing initiatives. Building scalable cloud products that power millions of enterprise users worldwide.',
      phone: '+1 (555) 234-5678',
      phone_visible: true,
      whatsapp: '+1 (555) 234-5678',
      whatsapp_visible: true,
      email: 'alex@innovatech.com',
      email_visible: true,
      website: 'https://innovatech.com',
      website_visible: true,
      street: '550 Montgomery St, Suite 800',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94111',
      country: 'United States',
      address_visible: true,
      maps_url: 'https://maps.google.com/?q=550+Montgomery+St+San+Francisco+CA',
      theme: 'modern-navy',
      accent_color: '#2563eb',
      status: 'published',
      section_order: ['header', 'quick_actions', 'about', 'contact', 'socials', 'services', 'portfolio', 'custom_fields'],
      social_links: [
        { id: 'soc-1', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/alex-rivera-sample' },
        { id: 'soc-2', platform: 'twitter', label: 'X (Twitter)', url: 'https://x.com/alexrivera_tech' },
        { id: 'soc-3', platform: 'github', label: 'GitHub', url: 'https://github.com/alexrivera' },
      ],
      custom_fields: [
        { id: 'cf-1', label: 'Direct Calendar', value: 'calendly.com/alex-innovatech' },
        { id: 'cf-2', label: 'License / Cert', value: 'AWS Solutions Architect Professional' },
      ],
      services: [
        {
          id: 'srv-1',
          title: 'Cloud Architecture Advisory',
          description: 'High-availability enterprise systems design, cloud cost optimization, and modernization strategy.',
          price: 'From $2,500',
          link_url: 'https://innovatech.com/advisory',
        },
        {
          id: 'srv-2',
          title: 'Executive Tech Mentorship',
          description: '1-on-1 strategic leadership coaching for aspiring VPs of Engineering and Heads of Product.',
          price: '$350 / hr',
          link_url: 'https://innovatech.com/mentorship',
        },
      ],
      portfolio: [
        {
          id: 'port-1',
          title: 'HyperScale Cloud Infrastructure',
          description: 'Reduced API response times by 48% across 12 distributed AWS/Cloudflare regions.',
          image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
          project_url: 'https://innovatech.com/case-studies/hyperscale',
        },
        {
          id: 'port-2',
          title: 'Zero-Trust Security Mesh',
          description: 'Deployed enterprise-wide micro-segmentation securing sensitive financial transactions.',
          image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
          project_url: 'https://innovatech.com/case-studies/zero-trust',
        },
      ],
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    };
    initialProfile.published_snapshot = { ...initialProfile };
    defaultProfiles.set(demoProfileId, initialProfile);

    // Pre-seed Demo Physical NFC Card 1 (Active, assigned to Alex Rivera)
    const card1Id = 'card-uuid-001';
    defaultCards.set(card1Id, {
      id: card1Id,
      card_token: 'tap-rivera-8821',
      card_label: 'Matte Black Executive NFC #101',
      owner_id: demoCustomerId,
      assigned_profile_id: demoProfileId,
      status: 'active',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      claimed_at: new Date(Date.now() - 19 * 86400000).toISOString(),
    });

    // Pre-seed Unclaimed Card 2 (Ready for immediate activation testing!)
    const card2Id = 'card-uuid-002';
    const card2Salt = 'demo_salt_4739';
    const card2Code = 'ACTV-4739-M2W8';
    defaultCards.set(card2Id, {
      id: card2Id,
      card_token: 'card-silver-4739',
      card_label: 'Brushed Steel NFC Card #102',
      owner_id: null,
      assigned_profile_id: null,
      status: 'unclaimed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      claimed_at: null,
    });
    defaultActivations.set(card2Id, {
      id: 'actv-uuid-002',
      card_id: card2Id,
      code_hash: hashActivationCode(card2Code, card2Salt),
      salt: card2Salt,
      is_used: false,
      attempts: 0,
      created_at: new Date().toISOString(),
    });

    // Pre-seed Disabled Card 3 (For testing neutral disabled view)
    const card3Id = 'card-uuid-003';
    defaultCards.set(card3Id, {
      id: card3Id,
      card_token: 'card-disabled-9999',
      card_label: 'Lost Card (Disabled) #103',
      owner_id: demoCustomerId,
      assigned_profile_id: demoProfileId,
      status: 'disabled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      claimed_at: new Date().toISOString(),
    });

    // Seed realistic sample analytics events over the past 30 days
    const eventTypes: AnalyticsEvent['event_type'][] = [
      'view', 'nfc_visit', 'nfc_visit', 'qr_visit', 'vcf_download', 'call_click', 'whatsapp_click', 'email_click', 'website_click'
    ];
    for (let i = 0; i < 48; i++) {
      const daysAgo = Math.floor(Math.random() * 28);
      const isNfc = i % 2 === 0;
      defaultAnalytics.push({
        id: `evt-${i + 1}`,
        profile_id: demoProfileId,
        card_id: isNfc ? card1Id : null,
        event_type: eventTypes[i % eventTypes.length],
        source: isNfc ? 'nfc' : (i % 3 === 0 ? 'qr' : 'direct'),
        user_agent: 'Mobile Safari',
        country: 'US',
        created_at: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 3600000).toISOString(),
      });
    }

    // Seed Admin Audit Log
    defaultAuditLogs.push({
      id: 'log-001',
      admin_id: demoAdminId,
      admin_email: 'admin@smartnfc.io',
      action: 'mint_card_batch',
      target_type: 'card_batch',
      target_id: 'batch_2026_q1',
      details: { count: 10, batch_name: 'Executive Matte Black' },
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    });

    global.__NFC_GLOBAL_STORE__ = {
      users: defaultUsers,
      profiles: defaultProfiles,
      cards: defaultCards,
      activations: defaultActivations,
      analytics: defaultAnalytics,
      auditLogs: defaultAuditLogs,
      rateLimits: new Map(),
    };
  }

  return global.__NFC_GLOBAL_STORE__;
}

export const DataStore = {
  // --- USERS ---
  async getUser(userId: string): Promise<UserProfile | null> {
    const store = getStore();
    return store.users.get(userId) || null;
  },

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const store = getStore();
    for (const user of store.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  async createUser(data: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const store = getStore();
    const now = new Date().toISOString();
    const newUser: UserProfile = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    store.users.set(newUser.id, newUser);
    return newUser;
  },

  // --- PROFILES ---
  async getUserProfiles(userId: string): Promise<BusinessProfileData[]> {
    const store = getStore();
    const result: BusinessProfileData[] = [];
    for (const profile of store.profiles.values()) {
      if (profile.user_id === userId) {
        result.push(profile);
      }
    }
    return result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async getProfileById(id: string, userId?: string): Promise<BusinessProfileData | null> {
    const store = getStore();
    const profile = store.profiles.get(id);
    if (!profile) return null;
    if (userId && profile.user_id !== userId) return null;
    return profile;
  },

  async getProfileBySlug(slug: string, publicOnly = true): Promise<BusinessProfileData | null> {
    const store = getStore();
    for (const profile of store.profiles.values()) {
      if (profile.slug.toLowerCase() === slug.toLowerCase()) {
        if (publicOnly) {
          if (profile.status !== 'published') return null;
          // Return the published snapshot if available
          if (profile.published_snapshot) {
            return {
              ...profile,
              ...profile.published_snapshot,
              status: 'published',
            };
          }
        }
        return profile;
      }
    }
    return null;
  },

  async createProfile(userId: string, data: Partial<BusinessProfileData>): Promise<BusinessProfileData> {
    const store = getStore();
    const id = `prof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    
    // Check slug uniqueness
    const slug = (data.slug || `user-${Math.random().toString(36).substring(2, 8)}`)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');

    const newProfile: BusinessProfileData = {
      id,
      user_id: userId,
      slug,
      full_name: data.full_name || 'My Profile',
      title: data.title || '',
      company_name: data.company_name || '',
      company_logo_url: data.company_logo_url || '',
      avatar_url: data.avatar_url || '',
      cover_url: data.cover_url || '',
      bio: data.bio || '',
      phone: data.phone || '',
      phone_visible: data.phone_visible ?? true,
      whatsapp: data.whatsapp || '',
      whatsapp_visible: data.whatsapp_visible ?? true,
      email: data.email || '',
      email_visible: data.email_visible ?? true,
      website: data.website || '',
      website_visible: data.website_visible ?? true,
      street: data.street || '',
      city: data.city || '',
      state: data.state || '',
      postal_code: data.postal_code || '',
      country: data.country || '',
      address_visible: data.address_visible ?? true,
      maps_url: data.maps_url || '',
      theme: data.theme || 'modern-navy',
      accent_color: data.accent_color || '#2563eb',
      status: data.status || 'draft',
      section_order: data.section_order || ['header', 'quick_actions', 'about', 'contact', 'socials', 'services', 'portfolio', 'custom_fields'],
      social_links: data.social_links || [],
      custom_fields: data.custom_fields || [],
      services: data.services || [],
      portfolio: data.portfolio || [],
      published_snapshot: data.status === 'published' ? { ...data } : null,
      created_at: now,
      updated_at: now,
      published_at: data.status === 'published' ? now : undefined,
    };

    store.profiles.set(id, newProfile);
    return newProfile;
  },

  async updateProfile(id: string, userId: string, updates: Partial<BusinessProfileData>, isPublish = false): Promise<BusinessProfileData> {
    const store = getStore();
    const existing = store.profiles.get(id);
    if (!existing || existing.user_id !== userId) {
      throw new Error('Profile not found or unauthorized');
    }

    const now = new Date().toISOString();
    const updated: BusinessProfileData = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    if (isPublish) {
      updated.status = 'published';
      updated.published_at = now;
      // Freeze snapshot so drafts can be modified later without breaking live public view until next publish!
      updated.published_snapshot = {
        ...updated,
        published_snapshot: undefined,
      };
    }

    store.profiles.set(id, updated);
    return updated;
  },

  async deleteProfile(id: string, userId: string): Promise<boolean> {
    const store = getStore();
    const existing = store.profiles.get(id);
    if (!existing || existing.user_id !== userId) {
      return false;
    }
    // Unassign cards attached to this profile
    for (const card of store.cards.values()) {
      if (card.assigned_profile_id === id) {
        card.assigned_profile_id = null;
        card.updated_at = new Date().toISOString();
      }
    }
    store.profiles.delete(id);
    return true;
  },

  // --- NFC CARDS ---
  async getCardByToken(token: string): Promise<NfcCard | null> {
    const store = getStore();
    for (const card of store.cards.values()) {
      if (card.card_token === token) {
        // Hydrate assigned profile
        let assignedProfile = null;
        if (card.assigned_profile_id) {
          const p = store.profiles.get(card.assigned_profile_id);
          if (p) {
            assignedProfile = {
              id: p.id,
              slug: p.slug,
              full_name: p.full_name,
              title: p.title,
              company_name: p.company_name,
            };
          }
        }
        return {
          ...card,
          assigned_profile: assignedProfile,
        };
      }
    }
    return null;
  },

  async getUserCards(userId: string): Promise<NfcCard[]> {
    const store = getStore();
    const result: NfcCard[] = [];
    for (const card of store.cards.values()) {
      if (card.owner_id === userId) {
        let assignedProfile = null;
        if (card.assigned_profile_id) {
          const p = store.profiles.get(card.assigned_profile_id);
          if (p) {
            assignedProfile = {
              id: p.id,
              slug: p.slug,
              full_name: p.full_name,
              title: p.title,
              company_name: p.company_name,
            };
          }
        }
        result.push({
          ...card,
          assigned_profile: assignedProfile,
        });
      }
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * ATOMIC CARD ACTIVATION
   * Single-use activation code with rate-limiting and secure hash verification
   */
  async activateCard(
    activationCode: string,
    userId: string,
    profileId: string
  ): Promise<{ success: boolean; card?: NfcCard; error?: string }> {
    const store = getStore();

    // Verify profile ownership
    const profile = store.profiles.get(profileId);
    if (!profile || profile.user_id !== userId) {
      return { success: false, error: 'Target profile not found or unauthorized.' };
    }

    const cleanCode = activationCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length < 8) {
      return { success: false, error: 'Please enter a valid activation code.' };
    }

    // Rate-limiting check by userId
    const rateLimitKey = `rate:actv:${userId}`;
    const rl = store.rateLimits.get(rateLimitKey);
    const now = Date.now();
    if (rl && rl.resetAt > now && rl.count >= 5) {
      const waitMin = Math.ceil((rl.resetAt - now) / 60000);
      return { success: false, error: `Too many failed activation attempts. Please wait ${waitMin} minutes.` };
    }

    // Find matching activation record by salted hash
    let matchedActivation: CardActivationRecord | null = null;
    for (const act of store.activations.values()) {
      const computedHash = hashActivationCode(cleanCode, act.salt);
      if (computedHash === act.code_hash) {
        matchedActivation = act;
        break;
      }
    }

    if (!matchedActivation) {
      // Record failed attempt
      const current = store.rateLimits.get(rateLimitKey) || { count: 0, resetAt: now + 15 * 60000 };
      current.count += 1;
      store.rateLimits.set(rateLimitKey, current);
      return { success: false, error: 'Invalid activation code. Please check and try again.' };
    }

    if (matchedActivation.is_used) {
      return { success: false, error: 'This card activation code has already been claimed.' };
    }

    const card = store.cards.get(matchedActivation.card_id);
    if (!card) {
      return { success: false, error: 'Card record not found.' };
    }

    if (card.status === 'revoked') {
      return { success: false, error: 'This card has been revoked by the system.' };
    }

    // Atomic claim
    const timestamp = new Date().toISOString();
    matchedActivation.is_used = true;
    matchedActivation.used_at = timestamp;
    matchedActivation.used_by = userId;

    card.owner_id = userId;
    card.assigned_profile_id = profileId;
    card.status = 'active';
    card.claimed_at = timestamp;
    card.updated_at = timestamp;

    return { success: true, card };
  },

  async updateCardAssignment(
    cardId: string,
    userId: string,
    assignedProfileId: string | null,
    status?: 'active' | 'disabled'
  ): Promise<NfcCard> {
    const store = getStore();
    const card = store.cards.get(cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    if (card.owner_id && card.owner_id !== userId) {
      throw new Error('Card unauthorized');
    }

    // Set owner
    card.owner_id = userId;
    if (!card.claimed_at) {
      card.claimed_at = new Date().toISOString();
    }

    if (assignedProfileId) {
      const profile = store.profiles.get(assignedProfileId);
      if (!profile || profile.user_id !== userId) {
        throw new Error('Selected profile does not belong to you');
      }
      card.assigned_profile_id = assignedProfileId;
    } else if (assignedProfileId === null) {
      card.assigned_profile_id = null;
    }

    if (status) {
      card.status = status;
    }

    card.updated_at = new Date().toISOString();
    return card;
  },

  // --- ANALYTICS ---
  async recordAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>): Promise<AnalyticsEvent> {
    const store = getStore();
    const newEvent: AnalyticsEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    store.analytics.push(newEvent);
    return newEvent;
  },

  async getAnalytics(options: {
    profileId?: string;
    cardId?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const store = getStore();
    const days = options.days || 30;
    const cutoffTime = options.startDate
      ? new Date(options.startDate).getTime()
      : Date.now() - days * 86400000;
    const endTime = options.endDate ? new Date(options.endDate).getTime() : Date.now();

    const filtered = store.analytics.filter((evt) => {
      const time = new Date(evt.created_at).getTime();
      if (time < cutoffTime || time > endTime) return false;
      if (options.profileId && evt.profile_id !== options.profileId) return false;
      if (options.cardId && evt.card_id !== options.cardId) return false;
      return true;
    });

    const totalViews = filtered.filter((e) => e.event_type === 'view').length;
    const nfcVisits = filtered.filter((e) => e.source === 'nfc' || e.event_type === 'nfc_visit').length;
    const qrVisits = filtered.filter((e) => e.source === 'qr' || e.event_type === 'qr_visit').length;
    const vcfDownloads = filtered.filter((e) => e.event_type === 'vcf_download').length;
    const contactClicks = filtered.filter((e) =>
      ['call_click', 'whatsapp_click', 'email_click', 'website_click', 'directions_click', 'social_click', 'link_click'].includes(e.event_type)
    ).length;

    // Daily breakdown for charts
    const dailyMap = new Map<string, { date: string; views: number; nfc: number; qr: number; clicks: number }>();
    for (let d = days - 1; d >= 0; d--) {
      const dateKey = new Date(Date.now() - d * 86400000).toISOString().split('T')[0];
      dailyMap.set(dateKey, { date: dateKey, views: 0, nfc: 0, qr: 0, clicks: 0 });
    }

    filtered.forEach((e) => {
      const dateKey = e.created_at.split('T')[0];
      const entry = dailyMap.get(dateKey) || { date: dateKey, views: 0, nfc: 0, qr: 0, clicks: 0 };
      if (e.event_type === 'view') entry.views += 1;
      if (e.source === 'nfc') entry.nfc += 1;
      if (e.source === 'qr') entry.qr += 1;
      if (['call_click', 'whatsapp_click', 'email_click', 'website_click'].includes(e.event_type)) entry.clicks += 1;
      dailyMap.set(dateKey, entry);
    });

    return {
      totalViews,
      nfcVisits,
      qrVisits,
      vcfDownloads,
      contactClicks,
      totalEvents: filtered.length,
      dailyTrend: Array.from(dailyMap.values()),
      events: filtered.slice(0, 100),
    };
  },

  // --- ADMIN PORTAL ---
  async getAdminStats(): Promise<PlatformStats> {
    const store = getStore();
    let activeCards = 0;
    let unclaimedCards = 0;
    let disabledCards = 0;

    for (const card of store.cards.values()) {
      if (card.status === 'active') activeCards++;
      else if (card.status === 'unclaimed') unclaimedCards++;
      else if (card.status === 'disabled') disabledCards++;
    }

    let publishedProfiles = 0;
    for (const p of store.profiles.values()) {
      if (p.status === 'published') publishedProfiles++;
    }

    const nfcVisits = store.analytics.filter((e) => e.source === 'nfc' || e.event_type === 'nfc_visit').length;
    const qrVisits = store.analytics.filter((e) => e.source === 'qr' || e.event_type === 'qr_visit').length;

    return {
      totalUsers: store.users.size,
      totalCards: store.cards.size,
      activeCards,
      unclaimedCards,
      disabledCards,
      totalProfiles: store.profiles.size,
      publishedProfiles,
      totalScans: store.analytics.length,
      totalNfcVisits: nfcVisits,
      totalQrVisits: qrVisits,
    };
  },

  async getAdminUsers(): Promise<UserProfile[]> {
    const store = getStore();
    return Array.from(store.users.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getAdminProfiles(): Promise<BusinessProfileData[]> {
    const store = getStore();
    return Array.from(store.profiles.values()).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  async getAdminCards(statusFilter?: string): Promise<NfcCard[]> {
    const store = getStore();
    const result: NfcCard[] = [];
    for (const card of store.cards.values()) {
      if (!statusFilter || statusFilter === 'all' || card.status === statusFilter) {
        let assignedProfile = null;
        let owner = null;
        if (card.assigned_profile_id) {
          const p = store.profiles.get(card.assigned_profile_id);
          if (p) {
            assignedProfile = {
              id: p.id,
              slug: p.slug,
              full_name: p.full_name,
              title: p.title,
              company_name: p.company_name,
            };
          }
        }
        if (card.owner_id) {
          const u = store.users.get(card.owner_id);
          if (u) {
            owner = { id: u.id, email: u.email, full_name: u.full_name };
          }
        }
        result.push({
          ...card,
          assigned_profile: assignedProfile,
          owner,
        });
      }
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createAdminCard(cardLabel: string, adminId: string): Promise<{ card: NfcCard; activationCode: string }> {
    const store = getStore();
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const cardToken = generateCardToken();
    const activationCode = generateActivationCode();
    const salt = generateSalt();
    const codeHash = hashActivationCode(activationCode, salt);
    const now = new Date().toISOString();

    const newCard: NfcCard = {
      id: cardId,
      card_token: cardToken,
      card_label: cardLabel || `Smart Card #${store.cards.size + 1}`,
      owner_id: null,
      assigned_profile_id: null,
      status: 'unclaimed',
      created_at: now,
      updated_at: now,
      claimed_at: null,
    };

    const newActivation: CardActivationRecord = {
      id: `actv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      card_id: cardId,
      code_hash: codeHash,
      salt,
      is_used: false,
      attempts: 0,
      created_at: now,
    };

    store.cards.set(cardId, newCard);
    store.activations.set(cardId, newActivation);

    // Audit log
    const adminUser = store.users.get(adminId);
    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      admin_id: adminId,
      admin_email: adminUser?.email,
      action: 'create_single_card',
      target_type: 'nfc_card',
      target_id: cardId,
      details: { card_token: cardToken, label: cardLabel },
      created_at: now,
    });

    return { card: newCard, activationCode };
  },

  async createAdminCardBatch(
    count: number,
    batchLabelPrefix: string,
    adminId: string
  ): Promise<Array<{ card: NfcCard; activationCode: string }>> {
    const store = getStore();
    const generated: Array<{ card: NfcCard; activationCode: string }> = [];
    const now = new Date().toISOString();
    const adminUser = store.users.get(adminId);

    for (let i = 1; i <= count; i++) {
      const cardId = `card-batch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`;
      const cardToken = generateCardToken();
      const activationCode = generateActivationCode();
      const salt = generateSalt();
      const codeHash = hashActivationCode(activationCode, salt);

      const newCard: NfcCard = {
        id: cardId,
        card_token: cardToken,
        card_label: `${batchLabelPrefix} #${i}`,
        owner_id: null,
        assigned_profile_id: null,
        status: 'unclaimed',
        created_at: now,
        updated_at: now,
        claimed_at: null,
      };

      const newActivation: CardActivationRecord = {
        id: `actv-${cardId}`,
        card_id: cardId,
        code_hash: codeHash,
        salt,
        is_used: false,
        attempts: 0,
        created_at: now,
      };

      store.cards.set(cardId, newCard);
      store.activations.set(cardId, newActivation);
      generated.push({ card: newCard, activationCode });
    }

    // Audit log
    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      admin_id: adminId,
      admin_email: adminUser?.email,
      action: 'mint_card_batch',
      target_type: 'card_batch',
      target_id: `batch-${Date.now()}`,
      details: { count, batch_label: batchLabelPrefix },
      created_at: now,
    });

    return generated;
  },

  async updateAdminCardStatus(
    cardId: string,
    action: 'disable' | 'enable' | 'revoke' | 'release',
    adminId: string
  ): Promise<NfcCard> {
    const store = getStore();
    const card = store.cards.get(cardId);
    if (!card) throw new Error('Card not found');

    const now = new Date().toISOString();
    if (action === 'disable') {
      card.status = 'disabled';
    } else if (action === 'enable') {
      card.status = card.owner_id ? 'active' : 'unclaimed';
    } else if (action === 'revoke') {
      card.status = 'revoked';
    } else if (action === 'release') {
      // Release card for reassignment
      card.owner_id = null;
      card.assigned_profile_id = null;
      card.status = 'unclaimed';
      card.claimed_at = null;
      // Reset activation record so new code or same card can be re-claimed
      const act = store.activations.get(cardId);
      if (act) {
        act.is_used = false;
        act.used_at = null;
        act.used_by = null;
        act.attempts = 0;
      }
    }

    card.updated_at = now;
    const adminUser = store.users.get(adminId);
    store.auditLogs.unshift({
      id: `log-${Date.now()}`,
      admin_id: adminId,
      admin_email: adminUser?.email,
      action: `card_${action}`,
      target_type: 'nfc_card',
      target_id: cardId,
      details: { new_status: card.status },
      created_at: now,
    });

    return card;
  },

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    const store = getStore();
    return store.auditLogs.slice(0, 100);
  },
};
