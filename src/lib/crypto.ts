import crypto from 'crypto';

/**
 * Generates a cryptographically random card token for the permanent NFC card URL
 * Example: 'c7f9-2a4b-8e1d'
 */
export function generateCardToken(): string {
  const bytes = crypto.randomBytes(8);
  const hex = bytes.toString('hex');
  return `card-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/**
 * Generates an activation code formatted like 'ACTV-7842-K9X3'
 * Easy for humans to read from a printed card slip or packaging
 */
export function generateActivationCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  const bytes = crypto.randomBytes(8);

  for (let i = 0; i < 4; i++) {
    part1 += chars[bytes[i] % chars.length];
    part2 += chars[bytes[i + 4] % chars.length];
  }

  return `ACTV-${part1}-${part2}`;
}

/**
 * Creates a salted SHA-256 hash of the normalized activation code
 */
export function hashActivationCode(code: string, salt: string): string {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHash('sha256').update(`${salt}:${normalized}`).digest('hex');
}

/**
 * Generates a random cryptographic salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}
