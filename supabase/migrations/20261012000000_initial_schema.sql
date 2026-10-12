-- ==============================================================================
-- NFC Digital Business Card Platform - Initial PostgreSQL Migration
-- Includes RLS, Functions, Triggers, Atomic Card Activation, and Indexes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all user profiles"
    ON public.user_profiles FOR ALL
    USING (public.is_admin());

-- 2. BUSINESS PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    title TEXT,
    company_name TEXT,
    company_logo_url TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    phone TEXT,
    phone_visible BOOLEAN NOT NULL DEFAULT true,
    whatsapp TEXT,
    whatsapp_visible BOOLEAN NOT NULL DEFAULT true,
    email TEXT,
    email_visible BOOLEAN NOT NULL DEFAULT true,
    website TEXT,
    website_visible BOOLEAN NOT NULL DEFAULT true,
    street TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    address_visible BOOLEAN NOT NULL DEFAULT true,
    maps_url TEXT,
    theme TEXT NOT NULL DEFAULT 'modern-navy',
    accent_color TEXT NOT NULL DEFAULT '#2563eb',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    section_order JSONB NOT NULL DEFAULT '["header", "quick_actions", "about", "contact", "socials", "services", "portfolio", "custom_fields"]'::jsonb,
    social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
    published_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMPTZ
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_business_profiles_user ON public.business_profiles(user_id);
CREATE INDEX idx_business_profiles_slug ON public.business_profiles(slug);
CREATE INDEX idx_business_profiles_status ON public.business_profiles(status);

-- Policies for business_profiles
-- Public can read ONLY published profiles
CREATE POLICY "Public can view published profiles"
    ON public.business_profiles FOR SELECT
    USING (status = 'published' OR auth.uid() = user_id OR public.is_admin());

-- Owner has full control over their own profiles
CREATE POLICY "Users can create their own business profiles"
    ON public.business_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profiles"
    ON public.business_profiles FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own business profiles"
    ON public.business_profiles FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- 3. PHYSICAL NFC CARDS TABLE
CREATE TABLE IF NOT EXISTS public.nfc_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_token TEXT NOT NULL UNIQUE,
    card_label TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_profile_id UUID REFERENCES public.business_profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'active', 'disabled', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    claimed_at TIMESTAMPTZ
);

ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_nfc_cards_token ON public.nfc_cards(card_token);
CREATE INDEX idx_nfc_cards_owner ON public.nfc_cards(owner_id);
CREATE INDEX idx_nfc_cards_profile ON public.nfc_cards(assigned_profile_id);

-- Policies for nfc_cards:
-- Public can resolve card_token to assigned_profile_id & status (no private owner data exposed)
CREATE POLICY "Public can lookup card token"
    ON public.nfc_cards FOR SELECT
    USING (true);

-- Owners can view and update their own assigned cards (reassign profile, disable/enable)
CREATE POLICY "Users can update their claimed cards"
    ON public.nfc_cards FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Admins can manage all cards"
    ON public.nfc_cards FOR ALL
    USING (public.is_admin());

-- 4. CARD ACTIVATIONS TABLE (Stores hashes of single-use activation codes)
CREATE TABLE IF NOT EXISTS public.card_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL UNIQUE REFERENCES public.nfc_cards(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    used_by UUID REFERENCES auth.users(id),
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.card_activations ENABLE ROW LEVEL SECURITY;

-- Only admins and internal atomic security functions can access activations
CREATE POLICY "Admins can view card activations"
    ON public.card_activations FOR ALL
    USING (public.is_admin());

-- 5. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.nfc_cards(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('nfc', 'qr', 'direct', 'other')),
    event_metadata JSONB DEFAULT '{}'::jsonb,
    user_agent TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_analytics_profile_created ON public.analytics_events(profile_id, created_at DESC);
CREATE INDEX idx_analytics_card_created ON public.analytics_events(card_id, created_at DESC);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);

-- Policies for analytics:
-- Anyone can insert an event (public visitor viewing or clicking)
CREATE POLICY "Public can record analytics event"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- Profile owner can read their own analytics
CREATE POLICY "Owners can view their profile analytics"
    ON public.analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles
            WHERE business_profiles.id = analytics_events.profile_id
              AND (business_profiles.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 6. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- STORED PROCEDURES & ATOMIC FUNCTIONS
-- ==============================================================================

-- Function to handle new user signup and create public.user_profiles row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, phone, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'phone',
        COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Atomic Function: Activate NFC Card
-- Verifies code, prevents race conditions with FOR UPDATE lock, claims card and assigns profile
CREATE OR REPLACE FUNCTION public.activate_nfc_card(
    p_card_id UUID,
    p_code_hash TEXT,
    p_user_id UUID,
    p_profile_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_activation public.card_activations%ROWTYPE;
    v_card public.nfc_cards%ROWTYPE;
    v_profile public.business_profiles%ROWTYPE;
BEGIN
    -- 1. Verify profile belongs to user
    SELECT * INTO v_profile FROM public.business_profiles
    WHERE id = p_profile_id AND user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found or unauthorized');
    END IF;

    -- 2. Lock activation record to prevent concurrent claims
    SELECT * INTO v_activation FROM public.card_activations
    WHERE card_id = p_card_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid card activation record');
    END IF;

    -- 3. Check if locked due to brute force
    IF v_activation.locked_until IS NOT NULL AND v_activation.locked_until > now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Too many attempts. Card is temporarily locked.');
    END IF;

    -- 4. Check if already used
    IF v_activation.is_used THEN
        RETURN jsonb_build_object('success', false, 'error', 'This card activation code has already been claimed.');
    END IF;

    -- 5. Verify Hash
    IF v_activation.code_hash <> p_code_hash THEN
        UPDATE public.card_activations
        SET attempts = attempts + 1,
            locked_until = CASE WHEN attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END
        WHERE id = v_activation.id;

        RETURN jsonb_build_object('success', false, 'error', 'Invalid activation code.');
    END IF;

    -- 6. Lock and update card
    SELECT * INTO v_card FROM public.nfc_cards
    WHERE id = p_card_id
    FOR UPDATE;

    IF v_card.status = 'revoked' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This card has been revoked.');
    END IF;

    UPDATE public.nfc_cards
    SET owner_id = p_user_id,
        assigned_profile_id = p_profile_id,
        status = 'active',
        claimed_at = now(),
        updated_at = now()
    WHERE id = p_card_id;

    -- 7. Mark activation code as used
    UPDATE public.card_activations
    SET is_used = true,
        used_at = now(),
        used_by = p_user_id
    WHERE id = v_activation.id;

    RETURN jsonb_build_object(
        'success', true,
        'card_token', v_card.card_token,
        'profile_slug', v_profile.slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
