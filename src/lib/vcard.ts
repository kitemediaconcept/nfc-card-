import { BusinessProfileData } from '@/types';

/**
 * Escapes characters for vCard format according to RFC 2426 (vCard 3.0)
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generates an RFC 2426 compliant UTF-8 vCard 3.0 string
 * Only includes fields that are visible and populated
 */
export function generateVCard(profile: BusinessProfileData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `PRODID:-//NFC Smart Card Platform//EN`,
  ];

  // Full Name
  const fullName = profile.full_name.trim();
  const nameParts = fullName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;

  lines.push(`FN;CHARSET=UTF-8:${escapeVCardValue(fullName)}`);
  lines.push(`N;CHARSET=UTF-8:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);

  // Title / Designation
  if (profile.title?.trim()) {
    lines.push(`TITLE;CHARSET=UTF-8:${escapeVCardValue(profile.title.trim())}`);
  }

  // Company / Organization
  if (profile.company_name?.trim()) {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCardValue(profile.company_name.trim())}`);
  }

  // Phone
  if (profile.phone_visible && profile.phone?.trim()) {
    lines.push(`TEL;TYPE=CELL,VOICE:${profile.phone.trim()}`);
  }

  // WhatsApp
  if (profile.whatsapp_visible && profile.whatsapp?.trim() && profile.whatsapp !== profile.phone) {
    lines.push(`TEL;TYPE=WORK,MSG:${profile.whatsapp.trim()}`);
  }

  // Email
  if (profile.email_visible && profile.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${profile.email.trim()}`);
  }

  // Website
  if (profile.website_visible && profile.website?.trim()) {
    lines.push(`URL:${profile.website.trim()}`);
  }

  // Address: Post Office Box; Extended Address; Street Address; Locality; Region; Postal Code; Country
  if (profile.address_visible && (profile.street || profile.city || profile.state || profile.postal_code || profile.country)) {
    const street = profile.street ? escapeVCardValue(profile.street.trim()) : '';
    const city = profile.city ? escapeVCardValue(profile.city.trim()) : '';
    const state = profile.state ? escapeVCardValue(profile.state.trim()) : '';
    const postal = profile.postal_code ? escapeVCardValue(profile.postal_code.trim()) : '';
    const country = profile.country ? escapeVCardValue(profile.country.trim()) : '';

    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${street};${city};${state};${postal};${country}`);
  }

  // Bio / Note
  if (profile.bio?.trim()) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardValue(profile.bio.trim())}`);
  }

  // End vCard
  lines.push('REV:' + new Date().toISOString());
  lines.push('END:VCARD');

  return lines.join('\r\n');
}
