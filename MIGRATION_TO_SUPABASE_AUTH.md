# Migration from Clerk to Supabase Auth with Google OAuth

This document outlines the migration from Clerk authentication to Supabase Auth with Google OAuth.

## Prerequisites

1. **Google Cloud Console Setup**
   
   You need to create OAuth 2.0 credentials in Google Cloud Console:
   
   a. **Create a Google Cloud Project** (if you don't have one):
      - Go to [Google Cloud Console](https://console.cloud.google.com/)
      - Click "Select a project" > "New Project"
      - Enter project name (e.g., "TryCrib") and click "Create"
   
   b. **Enable Google+ API**:
      - In the Google Cloud Console, go to "APIs & Services" > "Library"
      - Search for "Google+ API" and enable it
      - Also enable "Google Identity Services API" if available
   
   c. **Create OAuth 2.0 Credentials**:
      - Go to "APIs & Services" > "Credentials"
      - Click "Create Credentials" > "OAuth client ID"
      - If prompted, configure the OAuth consent screen:
        - Choose "External" user type (unless you have a Google Workspace)
        - Fill in required fields:
          - App name: "TryCrib"
          - User support email: your email
          - Developer contact: your email
        - Add scopes: `email`, `profile`, `openid`
        - Add test users (if in testing mode)
      - Back in Credentials, select "Web application" as application type
      - Name: "TryCrib Web Client"
      - Authorized redirect URIs: Add these URLs:
        ```
        https://yourproject.supabase.co/auth/v1/callback
        http://localhost:3000/auth/callback
        https://yourdomain.com/auth/callback
        ```
        Note: The Supabase callback URL format is: `https://[your-project-ref].supabase.co/auth/v1/callback`
      - Click "Create"
      - **Save the Client ID and Client Secret** - you'll need these for Supabase

2. **Supabase Project Setup**
   - Ensure you have a Supabase project
   - Enable Google OAuth provider in Supabase Dashboard:
     - Go to Authentication > Providers
     - Find "Google" in the list and click to enable it
     - Paste your Google OAuth Client ID and Client Secret
     - Click "Save"
   - Configure Site URL:
     - Go to Authentication > URL Configuration
     - Set Site URL to your production URL (e.g., `https://yourdomain.com`)
     - Add Redirect URLs:
       - `http://localhost:3000/auth/callback` (for development)
       - `https://yourdomain.com/auth/callback` (for production)

3. **Environment Variables**
   Update your `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Migration Steps

### ✅ Completed

1. Created Supabase auth helpers (`lib/supabase/auth-helpers.ts`)
2. Created AuthProvider component (`components/auth/auth-provider.tsx`)
3. Created new auth page with Google OAuth (`app/auth/page.tsx`)
4. Created auth callback route (`app/auth/callback/route.ts`)
5. Updated root layout to use AuthProvider instead of ClerkProvider
6. Updated middleware to use Supabase auth

### 🔄 In Progress / TODO

1. **Update Components Using Clerk Hooks**
   - Replace `useUser()` from Clerk with `useAuth()` from AuthProvider
   - Replace `useClerk()` with `useAuth()` for signOut
   - Update Header component
   - Update all dashboard components
   - Update all components that check authentication state

2. **Update API Routes**
   - Replace `auth()` from Clerk with `getCurrentUser()` from auth-helpers
   - Update all API routes that use Clerk authentication
   - Files to update:
     - `app/api/buyer-listing-requests/route.ts`
     - `app/api/onboarding/set-role/route.ts`
     - `app/api/properties/*` routes
     - `app/api/agent/*` routes
     - `app/api/admin/*` routes
     - All other API routes using Clerk

3. **Update Page Components**
   - Replace `auth()` from Clerk with `getCurrentUser()` or `requireAuth()`
   - Update dashboard pages
   - Update admin pages
   - Update settings page
   - Update onboarding page

4. **Database Schema**
   - The profiles table already uses TEXT for id which works with Supabase UUIDs
   - May need to update RLS policies if they reference `auth.uid()`
   - Supabase uses UUID for user IDs, but storing as TEXT should work fine

5. **Remove Clerk Dependencies**
   - Remove `@clerk/nextjs` and `@clerk/clerk-react` from package.json
   - Remove Clerk webhook route (`app/api/webhooks/clerk/route.ts`)
   - Remove Clerk-related environment variables

6. **Update Profile Creation**
   - Create a database trigger or function to auto-create profiles when users sign up
   - Or handle profile creation in the auth callback

## Key Changes

### Authentication Pattern Changes

**Before (Clerk):**
```typescript
import { useUser, useClerk } from "@clerk/nextjs"
const { user, isSignedIn } = useUser()
const { signOut } = useClerk()
```

**After (Supabase):**
```typescript
import { useAuth } from "@/components/auth/auth-provider"
const { user, loading, signOut } = useAuth()
```

**Server-side (Before):**
```typescript
import { auth } from "@clerk/nextjs/server"
const { userId } = await auth()
```

**Server-side (After):**
```typescript
import { getCurrentUser } from "@/lib/supabase/auth-helpers"
const user = await getCurrentUser()
const userId = user?.id
```

## Testing Checklist

- [ ] Sign in with Google OAuth works
- [ ] Sign out works
- [ ] Protected routes redirect to auth page
- [ ] User profile is created on first sign in
- [ ] All dashboard pages load correctly
- [ ] All API routes authenticate correctly
- [ ] User data persists across page refreshes
- [ ] Middleware protects routes correctly

## Notes

- User IDs will change from Clerk format to Supabase UUID format
- Since you're not launched yet, losing user data is acceptable
- You may want to create a database trigger to auto-create profiles:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'buyer'
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  ```
