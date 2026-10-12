# SmartNFC - Dynamic NFC Digital Business Card Web Platform

A complete, production-grade dynamic NFC digital business card platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase PostgreSQL**, **Supabase Auth & Storage**, and configured for **Cloudflare Workers / Pages** deployment.

---

## 🌟 Key Architecture & Features

### 1. Permanent NFC Card Architecture (Zero Chip Rewriting)
- Physical chips are written once with a permanent URL: `https://yourdomain.com/c/{card-token}`.
- Server-side route handler resolves the card's currently assigned profile and issues a **307 Temporary Redirect** with `Cache-Control: no-store, no-cache, must-revalidate`.
- Users can update their bio, title, contact details, or even change their username without breaking physical NFC cards.
- Supports assigning multiple physical cards to a single profile, reassigning cards, and one-click disabling of lost cards.
- Disabled cards render a neutral unavailable screen; unclaimed cards show clear onboarding guidance without leaking private info.

### 2. Mobile-First Public Digital Business Cards (`/p/[slug]`)
- Modern, fast, and accessible design with custom theme selector (**Modern Navy**, **Sleek Dark**, **Emerald Luxury**, **Royal Amethyst**, **Sunset Amber**, **Minimal Light**).
- **One-Tap "Save Contact" (.vcf)**: Generates UTF-8 compliant RFC 2426 vCard 3.0 file with properly escaped names, phone, email, company, title, and address.
- Interactive action hub: Call, WhatsApp, Email, Website, Directions (Google Maps), Social links (LinkedIn, X, Instagram, YouTube, GitHub), Services, Portfolio showcase, and Custom fields.
- Built-in QR Code viewer & Web Share API with clipboard fallback.
- Only visible and published information is exposed to public visitors.

### 3. Customer Dashboard (`/dashboard`)
- **Overview**: Instant KPI metrics (Total Views, NFC-link visits, QR visits, vCard downloads).
- **My Profiles**: Create, duplicate, preview, and manage multiple business cards.
- **Profile Editor**: Split-screen live phone preview updating in real-time on desktop; easy toggle on mobile. Live Draft vs. Published snapshot separation.
- **My NFC Cards**: Manage claimed chips, view permanent URLs, reassign profiles, and disable lost cards. Direct Web NFC chip-writing on supported mobile browsers.
- **Activate Card**: Single-use code verification (`ACTV-XXXX-XXXX`) with confetti celebration and brute-force rate-limiting.
- **QR Codes & Sharing**: High-resolution PNG (1024px) and vector SVG generation and download.
- **Privacy-Conscious Analytics**: Date range filters (7d, 30d, custom), profile/card filters, and daily visit breakdown.
- **Account Settings**: Update details, change password, and delete account confirmation flow.

### 4. Admin Console (`/admin`)
- Server-enforced administrator role (`role = 'admin'`).
- **NFC Card Minting**: Create individual cards or batch-mint up to 100 cards with cryptographic salted SHA-256 activation codes.
- **Production CSV Export**: Download minted batches containing Card Label, Card Token, Permanent URL, and Activation Codes for physical printing and programming.
- **Card Lifecycle Management**: View unclaimed, active, disabled, and revoked cards; release claimed cards for reassignment.
- **Customer Directory & Profile Auditing**: Search and manage user accounts and profiles.
- **Security Audit Logs**: Immutable history of sensitive administrative actions.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- The application runs out-of-the-box in local interactive mode with pre-seeded test data:
  - **Sample Public Card:** [http://localhost:3000/p/alexrivera](http://localhost:3000/p/alexrivera)
  - **Permanent NFC URL Redirect:** [http://localhost:3000/c/tap-rivera-8821](http://localhost:3000/c/tap-rivera-8821)
  - **Unclaimed Card Test:** [http://localhost:3000/c/card-silver-4739](http://localhost:3000/c/card-silver-4739)
  - **Pre-Minted Activation Code for testing:** `ACTV-4739-M2W8`
  - **Customer & Admin Switcher:** Built into the dashboard sidebar and login page for instant pair testing.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL migration scripts in the Supabase SQL Editor:
   - `supabase/migrations/20261012000000_initial_schema.sql` (Tables, RLS policies, atomic functions)
   - `supabase/migrations/20261012000001_seed_demo_data.sql` (Sample cards and pre-hashed codes)
3. Set your environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

---

## ☁️ Cloudflare Deployment

See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) for full deployment instructions using OpenNext (`@opennextjs/cloudflare`) and Wrangler.

```bash
# Build production bundle for Cloudflare Workers
npm run build:worker

# Deploy to Cloudflare
npm run deploy:worker
```

---

## 📡 Programming Physical NFC Cards

1. Install the free **NFC Tools** app on your phone (iOS or Android).
2. In your Customer Dashboard, copy your card's **Permanent Tap URL** (`https://yourdomain.com/c/your-token`).
3. In NFC Tools:
   - Select **Write** &rarr; **Add a record** &rarr; **URL / URI**.
   - Paste the URL and tap **Write**.
   - Hold your physical card (NTAG213 / NTAG215 / NTAG216 chip) to your phone until confirmed.
4. On Chrome for Android, you can also use the direct **"Write Chip"** button in the dashboard!
