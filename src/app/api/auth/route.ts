import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DataStore } from '@/lib/data-store';
import { DEMO_CUSTOMER_ID, DEMO_ADMIN_ID } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, fullName, phone, demoTarget } = body;

    const response = NextResponse.json({ success: true });

    // Handle Quick Demo User Switch
    if (action === 'demo_switch') {
      const targetUserId = demoTarget === 'admin' ? DEMO_ADMIN_ID : DEMO_CUSTOMER_ID;
      response.cookies.set('nfc_session_user', targetUserId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // Handle Supabase Auth if configured
    const supabase = await createClient();

    if (action === 'signup') {
      if (!email || !password || !fullName) {
        return NextResponse.json({ error: 'Please provide full name, email, and password.' }, { status: 400 });
      }

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone, role: 'customer' },
          },
        });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          user: data.user,
          message: 'Account created! Please check your email to verify your address.',
        });
      } else {
        // Local mode fallback signup
        const newId = `user-${Date.now()}`;
        const newUser = await DataStore.createUser({
          id: newId,
          email,
          full_name: fullName,
          phone,
          role: 'customer',
        });
        response.cookies.set('nfc_session_user', newId, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        });
        return response;
      }
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }

      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return response;
      } else {
        // Local fallback check
        const user = await DataStore.getUserByEmail(email);
        if (user) {
          response.cookies.set('nfc_session_user', user.id, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          });
          return response;
        } else {
          return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
        }
      }
    }

    if (action === 'logout') {
      if (supabase) {
        await supabase.auth.signOut();
      }
      response.cookies.delete('nfc_session_user');
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
