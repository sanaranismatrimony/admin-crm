# Sana Rani Matrimony — Admin CRM

A matrimonial CRM for Kalinga Vysya community matchmaking. Built with Next.js 16, Supabase, and AI-powered biodata extraction.

## Features

- **Admin Dashboard** — Manage profiles, matches, payments, and shares
- **Biodata AI Extraction** — Upload PDF/DOCX/Images; auto-fills form via rule-based + Groq AI extraction
- **Match Pipeline** — Track stages from profile sharing to marriage confirmation
- **Profile Management** — Full CRUD with 10-section form (personal, astro, family, education, preferences)
- **Photo Management** — Upload via Supabase Storage with lightbox preview
- **Biodata Card** — Auto-generated PDF biodata card for sharing
- **Public Profile View** — Token-based shareable profile view with interest action

## Prerequisites

- Node.js >= 18
- Supabase project (Postgres + Auth + Storage)
- Groq API key (for AI extraction — optional, falls back to rules-only)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
```

Edit `.env.local` with your Supabase and Groq credentials:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `GROQ_API_KEY` | Groq API key for AI extraction |

```bash
# 3. Run database migrations
# Run each file in supabase/migrations/ via Supabase SQL editor

# 4. Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack, Server Actions)
- **Database** — Supabase (Postgres + Auth + Storage)
- **AI Extraction** — pdf-parse, mammoth, Tesseract.js, Groq (openai/gpt-oss-120b)
- **Forms** — react-hook-form + Zod validation
- **PDF Gen** — @react-pdf/renderer
- **UI** — Tailwind CSS, Framer Motion, Lucide icons

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard, profiles, matches, payments
│   ├── api/                # API routes (biodata, parse, upload, generate-card)
│   └── view/               # Public profile view (token-based)
├── components/
│   ├── admin/              # Admin UI components
│   ├── pdf/                # PDF biodata card & certificate
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── ai/                 # Biodata extraction pipeline
│   ├── auth/               # Auth actions & middleware
│   ├── db/                 # Database queries
│   ├── supabase/           # Supabase client config
│   ├── utils/              # Utilities
│   └── validation/         # Zod schemas
└── types/                  # TypeScript types
```

## Database

Migrations are in `supabase/migrations/`. Run each file sequentially in the Supabase SQL editor. The schema includes:

- `profiles` — Biodata with 45+ fields (personal, astro, family, education, preferences)
- `matches` — Match pipeline with stage tracking
- `payments` — Payment records
- `families` — Family contact log
- `profile_shares` — Share tokens with interest tracking
- `profile_views` — View analytics
