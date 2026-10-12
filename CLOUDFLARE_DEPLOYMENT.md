# Cloudflare Deployment & Architecture Guide for SmartNFC

This comprehensive guide explains how to deploy the **SmartNFC Digital Business Card Platform** to Cloudflare Workers / Cloudflare Pages using OpenNext, connecting to Supabase for PostgreSQL database, authentication, and storage.

---

## 1. Architecture Overview

- **Hosting & Edge Delivery:** Cloudflare Workers / Pages with OpenNext adapter (`@opennextjs/cloudflare`) for low-latency server-side rendering, API route handlers, and zero-cache 307 redirects.
- **Database & Row Level Security:** Supabase PostgreSQL with full schema migrations, RLS policies, atomic functions, and audit logging.
- **Authentication:** Supabase Auth with server-side cookie handling (`@supabase/ssr`).
- **File Storage:** Supabase Storage (`avatars`, `covers`, `company_logos`, `portfolio`).
- **Permanent Chip URLs:** Permanent `/c/{card-token}` endpoints programmed once to the physical NDEF chip that dynamically redirect to `/p/{slug}` without rewriting physical hardware.

---

## 2. Supabase Database & Storage Setup

### 2.1 Database Migrations
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor**.
3. Run the migration script in:
   ```
   supabase/migrations/20261012000000_initial_schema.sql
   ```
   This creates:
   - `public.user_profiles` (Role-based access: `customer` vs `admin`)
   - `public.business_profiles` (Draft vs Published snapshot support, social links, portfolio, services)
   - `public.nfc_cards` (Permanent card tokens, status management)
   - `public.card_activations` (Cryptographic salted hash storage, rate-limiting)
   - `public.analytics_events` (Privacy-conscious event tracking)
   - `public.audit_logs` (Administrative operations history)
   - `public.activate_nfc_card(...)` (Atomic stored procedure preventing race conditions)
   - All necessary Row Level Security (RLS) policies and performance indexes.

4. (Optional) Run the seed demo data migration:
   ```
   supabase/migrations/20261012000001_seed_demo_data.sql
   ```

### 2.2 Supabase Storage Buckets
1. In your Supabase Dashboard, go to **Storage** -> **New Bucket**.
2. Create the following public buckets:
   - `avatars` (Public bucket, max file size 5MB, allowed MIME: `image/jpeg`, `image/png`, `image/webp`)
   - `covers` (Public bucket, max file size 5MB)
   - `portfolio` (Public bucket, max file size 10MB)
3. Set RLS storage policies allowing authenticated users to upload files to their own user folders (`auth.uid() = (storage.foldername(name))[1]`) and public visitors to read files.

### 2.3 Authentication Redirect URLs
1. In Supabase Dashboard, navigate to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your production domain:
   ```
   https://nfc-digital-card.pages.dev  (or your custom domain)
   ```
3. In **Redirect URLs**, add:
   ```
   http://localhost:3000/**
   https://nfc-digital-card.pages.dev/**
   https://yourdomain.com/**
   ```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Environment Variables Matrix:

| Variable Name | Client / Server | Description | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Base URL for permanent card URLs and QR codes | `https://yourdomain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Your Supabase project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public Supabase anonymous API key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server ONLY | Secret key for admin minting & audit operations | `eyJhbGciOi...` |

> **SECURITY WARNING:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components or public GitHub repositories. Only use it on the server.

---

## 4. Local Development

Run the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- You can immediately test out-of-the-box in local interactive mode.
- Use the quick switch button in the dashboard or login screen to test between **Customer (Alex Rivera)** and **Administrator**.
- Test permanent card redirect: [http://localhost:3000/c/tap-rivera-8821](http://localhost:3000/c/tap-rivera-8821)
- Test card activation with pre-seeded code: `ACTV-4739-M2W8`

---

## 5. Cloudflare Deployment with OpenNext

We configure OpenNext (`@opennextjs/cloudflare`) which compiles the Next.js App Router, Server Components, and Route Handlers for the Cloudflare Workers / Pages runtime.

### 5.1 OpenNext Build Command
Add or verify these scripts in `package.json`:
```json
{
  "scripts": {
    "build:worker": "opennextjs-cloudflare build",
    "deploy:worker": "npm run build:worker && wrangler deploy"
  }
}
```

### 5.2 Build for Cloudflare
```bash
npx opennextjs-cloudflare build
```

### 5.3 Deploy via Wrangler CLI
1. Log in to Cloudflare CLI:
   ```bash
   npx wrangler login
   ```
2. Set your production secrets in Cloudflare:
   ```bash
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Deploy:
   ```bash
   npx wrangler deploy
   ```

---

## 6. Custom Domain Setup on Cloudflare

1. Go to **Cloudflare Dashboard** -> **Workers & Pages**.
2. Select your `nfc-digital-card` deployment.
3. Click **Settings** -> **Domains & Routes** -> **Add Custom Domain**.
4. Enter your custom domain (e.g., `card.yourbrand.com` or `yourbrand.com`).
5. Cloudflare will automatically provision SSL/TLS certificates and point DNS records.
6. Update `NEXT_PUBLIC_APP_URL` in your Cloudflare environment variables to match your custom domain.

---

## 7. Initial Administrator Setup

To designate an account as an administrator:
1. In your Supabase Dashboard, go to **Table Editor** -> `user_profiles`.
2. Locate the row for your administrative email.
3. Change the `role` column value from `'customer'` to `'admin'`.
4. Sign in to your application. The sidebar will immediately expose the **Admin Console** at `/admin`.
5. From `/admin/cards`, you can now mint single physical NFC cards, generate card batches, and download production CSVs with activation codes.
