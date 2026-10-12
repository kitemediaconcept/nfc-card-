import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';
import { DEMO_CUSTOMER_ID } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      title,
      company_name,
      avatar_url,
      phone,
      whatsapp,
      email,
      website,
      street,
      city,
      state,
      postal_code,
      country,
      maps_url,
      bio,
      theme,
    } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'Customer full name is required' }, { status: 400 });
    }

    const cleanSlug = full_name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    // 1. Create Published Business Profile
    const profile = await DataStore.createProfile(DEMO_CUSTOMER_ID, {
      full_name: full_name.trim(),
      slug: cleanSlug,
      title: title?.trim() || '',
      company_name: company_name?.trim() || '',
      avatar_url: avatar_url?.trim() || '',
      bio: bio?.trim() || '',
      phone: phone?.trim() || '',
      phone_visible: true,
      whatsapp: (whatsapp || phone)?.trim() || '',
      whatsapp_visible: true,
      email: email?.trim() || '',
      email_visible: true,
      website: website?.trim() || '',
      website_visible: true,
      street: street?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      postal_code: postal_code?.trim() || '',
      country: country?.trim() || '',
      address_visible: true,
      maps_url: maps_url?.trim() || '',
      theme: theme || 'modern-navy',
      status: 'published',
    });

    // Make sure it is marked as published with a snapshot
    await DataStore.updateProfile(profile.id, DEMO_CUSTOMER_ID, profile, true);

    // 2. Mint an NFC Card assigned to this new profile
    const mintResult = await DataStore.createAdminCard(
      `${full_name.trim()}'s Smart NFC Card`,
      'admin-user-0001'
    );

    // 3. Mark card as active and assigned
    const activeCard = await DataStore.updateCardAssignment(
      mintResult.card.id,
      DEMO_CUSTOMER_ID,
      profile.id,
      'active'
    );

    const baseUrl = request.nextUrl.origin;
    const permanentNfcUrl = `${baseUrl}/c/${activeCard.card_token}`;
    const profileUrl = `${baseUrl}/p/${profile.slug}`;

    return NextResponse.json({
      success: true,
      profile,
      card: activeCard,
      permanentNfcUrl,
      profileUrl,
      activationCode: mintResult.activationCode,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating customer card';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
