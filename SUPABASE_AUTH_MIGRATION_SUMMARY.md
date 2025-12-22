# Supabase Auth Migration Summary

## ✅ Completed Steps

### 1. Core Infrastructure
- ✅ Created `lib/supabase/auth-helpers.ts` - Server-side auth utilities
- ✅ Created `components/auth/auth-provider.tsx` - Client-side auth context
- ✅ Updated `app/layout.tsx` - Replaced ClerkProvider with AuthProvider
- ✅ Updated `middleware.ts` - Replaced Clerk middleware with Supabase auth middleware
- ✅ Created `app/auth/page.tsx` - New auth page with Google OAuth
- ✅ Created `app/auth/callback/route.ts` - OAuth callback handler
- ✅ Created `app/auth/callback/page.tsx` - Callback loading page
- ✅ Created `scripts/058_create_profile_trigger.sql` - Auto-create profiles on signup

### 2. Updated Components
- ✅ Updated `components/landing/header.tsx` - Replaced Clerk hooks with Supabase auth

### 3. Updated API Routes (Example)
- ✅ Updated `app/api/buyer-listing-requests/route.ts` - Example of API route migration

## 🔄 Remaining Work

### Components to Update
All components using Clerk hooks need to be updated. Search for:
- `useUser()` → Replace with `useAuth()` from `@/components/auth/auth-provider`
- `useClerk()` → Replace with `useAuth()` for signOut
- `isSignedIn` → Replace with `user !== null`
- `isLoaded` → Replace with `loading` from useAuth

**Files to update:**
- `components/properties/listing-request-banner.tsx`
- `components/buyer/*` components
- `components/seller/*` components
- `components/agent/*` components
- `components/admin/*` components
- Any other components using Clerk hooks

### API Routes to Update
All API routes using `auth()` from Clerk need to be updated:

**Pattern:**
```typescript
// Before
import { auth } from "@clerk/nextjs/server"
const { userId } = await auth()

// After
import { getCurrentUser } from "@/lib/supabase/auth-helpers"
const user = await getCurrentUser()
const userId = user?.id
```

**Files to update:**
- `app/api/onboarding/set-role/route.ts`
- `app/api/properties/*` routes
- `app/api/agent/*` routes
- `app/api/admin/*` routes
- `app/api/stay-requests/route.ts`
- `app/api/property-listing-requests/route.ts`
- `app/api/contact/route.ts`
- All other API routes using Clerk

### Page Components to Update
Server components using Clerk auth:

**Pattern:**
```typescript
// Before
import { auth } from "@clerk/nextjs/server"
const { userId } = await auth()

// After
import { getCurrentUser, requireAuth } from "@/lib/supabase/auth-helpers"
const user = await requireAuth() // or getCurrentUser() if optional
```

**Files to update:**
- `app/dashboard/page.tsx`
- `app/dashboard/buyer/page.tsx`
- `app/dashboard/seller/page.tsx`
- `app/dashboard/agent/page.tsx`
- `app/admin/page.tsx`
- `app/settings/page.tsx`
- `app/onboarding/page.tsx`
- `app/properties/[id]/page.tsx`

### Database Setup

1. **Run the profile trigger migration:**
   ```bash
   # Run scripts/058_create_profile_trigger.sql in your Supabase SQL editor
   ```

2. **Update RLS Policies (if needed):**
   - Check if RLS policies use `auth.uid()` - these should work with Supabase
   - The profiles table already uses TEXT for id, which works with Supabase UUIDs

### Environment Variables

Update your `.env.local`:
```bash
# Remove Clerk variables (optional, but recommended)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# CLERK_SECRET_KEY=

# Ensure Supabase variables are set
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Google Cloud Console Setup

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Name it "TryCrib" (or your preferred name)

2. **Enable Required APIs:**
   - Go to "APIs & Services" > "Library"
   - Enable "Google+ API" (or "Google Identity Services API")

3. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information:
     - App name: "TryCrib"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "TryCrib Web Client"
   - **Authorized redirect URIs** - Add these (IMPORTANT):
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```
     Note: Replace `[your-project-ref]` with your actual Supabase project reference (found in your Supabase URL)
   - Click "Create"
   - **Copy the Client ID and Client Secret** - you'll need these next

### Supabase Dashboard Setup

1. **Enable Google OAuth:**
   - Go to Authentication > Providers
   - Find "Google" and click to enable it
   - Paste your Google OAuth Client ID (from step above)
   - Paste your Google OAuth Client Secret (from step above)
   - Click "Save"

2. **Configure Site URL:**
   - Go to Authentication > URL Configuration
   - Set Site URL to your production URL (e.g., `https://yourdomain.com`)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)

### Remove Clerk Dependencies

After migration is complete:
```bash
npm uninstall @clerk/nextjs @clerk/clerk-react
```

### Files to Delete

- `app/api/webhooks/clerk/route.ts` (Clerk webhook handler)
- `app/sign-in/[[...sign-in]]/page.tsx` (if exists)
- `app/sign-up/[[...sign-up]]/page.tsx` (if exists)
- `lib/clerk/server.ts` (if exists)

## Testing Checklist

- [ ] Google OAuth sign in works
- [ ] Sign out works
- [ ] Protected routes redirect correctly
- [ ] Profile is auto-created on first sign in
- [ ] All dashboard pages load
- [ ] All API routes authenticate correctly
- [ ] User session persists across refreshes
- [ ] Middleware protects routes correctly

## Notes

- User IDs will be UUIDs from Supabase (stored as TEXT in profiles table)
- The profile trigger automatically creates profiles and buyer_profiles on signup
- You may need to handle profile updates separately (e.g., in onboarding flow)
- RLS policies using `auth.uid()` should work with Supabase Auth
