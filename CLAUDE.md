# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TryCrib is a "try before you buy" real estate platform where users book short-term stays in properties before purchasing. Built with Next.js 15 (App Router), React 19, TypeScript, Supabase (PostgreSQL), and Clerk authentication.

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build (ESLint and TypeScript errors are ignored during build)
- `npm run lint` — Run ESLint
- `npm run start` — Start production server

No test framework is configured.

## Architecture

### Auth Flow
Clerk handles authentication (email/password, Google OAuth). Middleware (`middleware.ts`) protects `/dashboard`, `/admin`, `/settings`, and `/onboarding` routes. Auth routes (`/auth`, `/sso-callback`, `/sign-in`, `/sign-up`) are excluded from protection. Unauthenticated users are redirected to `/auth?tab=login`. Server-side helpers in `lib/clerk/server.ts` provide `getCurrentUserProfile()`, `requireAuth()`, and `requireRole()` for role-based access control.

### Roles
Four user roles (buyer, seller, admin, superadmin) plus two agent roles (buyer_agent, seller_agent). Role selection happens at `/onboarding`, then users are redirected to role-specific dashboards (`/dashboard/buyer`, `/dashboard/seller`, `/dashboard/agent`, `/admin`).

### Data Layer
- **Browser client**: `lib/supabase/client.ts` — for client components
- **Server client**: `lib/supabase/server.ts` — for server components/API routes (handles cookies)
- **Service client**: `lib/supabase/service.ts` — service role key, bypasses RLS

No Redux or state management library — uses React hooks and Supabase directly.

### Pricing System (`lib/pricing.ts`)
Tiered nightly pricing based on listing price (6 tiers from under $500K to over $5M). Properties over $5M show "Contact Seller" instead of a price. Tiers are stored in a `pricing_tiers` database table with admin-configurable rates.

### API Routes (`app/api/`)
Key route groups: `admin/` (imports, pricing, migrations), `properties/` (CRUD, search, claims), `pricing/` (calculations, tiers), `agent/` (invitations, stay requests), `stay-requests/`, `property-listing-requests/`, `buyer-listing-requests/`, `contact/`, `onboarding/`, `user/`, `unsubscribe/`, `webhooks/clerk`.

### Components (`components/`)
Organized by domain: `admin/`, `buyer/`, `seller/`, `agent/`, `landing/`, `onboarding/`, `properties/`, `settings/`, `analytics/`, `ui/` (shadcn/ui). The `ui/` directory uses shadcn/ui with "new-york" style.

### App Routes (`app/`)
`admin/`, `auth/`, `booking/`, `dashboard/` (buyer, seller, agent), `onboarding/`, `properties/`, `settings/`, `privacy/`, `terms/`, `unsubscribe/`, `sign-in/`, `sign-up/`, `sso-callback/`.

### Database Migrations (`scripts/`)
54 numbered SQL migration files (001-067, some numbers skipped). Run manually against Supabase. Core tables: profiles, properties, bookings, reviews, messages, property_availability, property_imports, property_claims, stay_requests, property_listing_requests, buyer_listing_requests, client_invitations.

### Email System
Uses Resend (`lib/email.ts`) with extensive HTML email templates. Supports unsubscribe functionality via svix webhooks.

## Key Conventions

- Path alias: `@/*` maps to project root
- TypeScript: strict mode is OFF
- Styling: Tailwind CSS 4 with CSS variables in OkLCH color format, dark mode via `.dark` class
- Fonts: Geist Sans and Geist Mono
- Forms: react-hook-form with zod validation
- Toasts: sonner
- Charts: recharts
- Images: Optimization disabled (`unoptimized: true` in next.config.mjs); uses Cloudinary for property images
- Analytics: Google Analytics (`NEXT_PUBLIC_GA_ID`) and Vercel Analytics
- Environment variables: Supabase (URL, anon key, service role key), Clerk (publishable key, secret key), Stripe, Cloudinary, Resend, Google Analytics, site URLs (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`)

## Reference Docs

- `COLORS.md` — Full color palette reference
- `ROADMAP.md` — Feature status and planned work
- `BUSINESS_PLAN.md` — Business model documentation
