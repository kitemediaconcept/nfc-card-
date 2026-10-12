export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ProfileStatus = 'draft' | 'published';

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'instagram' | 'whatsapp' | 'twitter' | 'facebook' | 'youtube' | 'github' | 'tiktok' | 'website' | 'other';
  label: string;
  url: string;
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  image_url?: string;
  link_url?: string;
}

export type ThemeId = 'modern-navy' | 'sleek-dark' | 'emerald-luxury' | 'royal-amethyst' | 'sunset-amber' | 'minimal-light';

export interface BusinessProfileData {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  title?: string;
  company_name?: string;
  company_logo_url?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  phone?: string;
  phone_visible: boolean;
  whatsapp?: string;
  whatsapp_visible: boolean;
  email?: string;
  email_visible: boolean;
  website?: string;
  website_visible: boolean;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  address_visible: boolean;
  maps_url?: string;
  theme: ThemeId;
  accent_color: string;
  status: ProfileStatus;
  section_order: string[];
  social_links: SocialLink[];
  custom_fields: CustomField[];
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  published_snapshot?: Partial<BusinessProfileData> | null;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export type CardStatus = 'unclaimed' | 'active' | 'disabled' | 'revoked';

export interface NfcCard {
  id: string;
  card_token: string;
  card_label?: string;
  owner_id?: string | null;
  assigned_profile_id?: string | null;
  status: CardStatus;
  created_at: string;
  updated_at: string;
  claimed_at?: string | null;
  // Join fields
  assigned_profile?: {
    id: string;
    slug: string;
    full_name: string;
    title?: string;
    company_name?: string;
  } | null;
  owner?: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}

export interface CardActivationRecord {
  id: string;
  card_id: string;
  code_hash: string;
  salt: string;
  is_used: boolean;
  used_at?: string | null;
  used_by?: string | null;
  attempts: number;
  locked_until?: string | null;
  created_at: string;
}

export type AnalyticsEventType =
  | 'view'
  | 'nfc_visit'
  | 'qr_visit'
  | 'vcf_download'
  | 'call_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'website_click'
  | 'directions_click'
  | 'social_click'
  | 'link_click';

export interface AnalyticsEvent {
  id: string;
  profile_id: string;
  card_id?: string | null;
  event_type: AnalyticsEventType;
  source: 'nfc' | 'qr' | 'direct' | 'other';
  event_metadata?: Record<string, unknown>;
  user_agent?: string;
  country?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalCards: number;
  activeCards: number;
  unclaimedCards: number;
  disabledCards: number;
  totalProfiles: number;
  publishedProfiles: number;
  totalScans: number;
  totalNfcVisits: number;
  totalQrVisits: number;
}
