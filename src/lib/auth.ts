import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import { DataStore } from './data-store';
import { UserProfile } from '@/types';

export const DEMO_CUSTOMER_ID = 'cust-user-1001';
export const DEMO_ADMIN_ID = 'admin-user-0001';

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get('nfc_session_user')?.value;

  // Try Supabase auth first if configured
  const supabase = await createClient();
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch or create profile
        let userProfile = await DataStore.getUser(user.id);
        if (!userProfile) {
          userProfile = await DataStore.createUser({
            id: user.id,
            email: user.email || '',
            full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
            phone: user.user_metadata?.phone as string | undefined,
            role: (user.user_metadata?.role as 'customer' | 'admin') || 'customer',
          });
        }
        return userProfile;
      }
    } catch {
      // Fallback
    }
  }

  // Fallback to cookie-based session or default demo customer
  const targetId = demoUserId || DEMO_CUSTOMER_ID;
  const user = await DataStore.getUser(targetId);
  return user || null;
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}
