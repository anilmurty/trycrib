-- Migration 054: Consolidate buyer_agent and seller_agent into single 'agent' role
-- This allows agents to work with both buyers and sellers

-- Step 1: Add 'agent' to the user_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND 
                 EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agent' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role'))) THEN
    ALTER TYPE user_role ADD VALUE 'agent';
  END IF;
END $$;

-- Step 2: Create unified agent_profiles table (combines buyer_agent_profiles and seller_agent_profiles)
-- Drop table if it exists to ensure clean creation
DROP TABLE IF EXISTS public.agent_profiles CASCADE;

CREATE TABLE public.agent_profiles (
  id TEXT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  brokerage_name TEXT,
  brokerage_license TEXT,
  years_experience INTEGER,
  specializations TEXT[],
  commission_rate DECIMAL(5,2) DEFAULT 2.50, -- From seller_agent_profiles
  phone TEXT,
  website TEXT,
  bio TEXT,
  email TEXT, -- Added in migration 043
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Migrate data from buyer_agent_profiles to agent_profiles
INSERT INTO public.agent_profiles (
  id, license_number, brokerage_name, brokerage_license, 
  years_experience, specializations, phone, website, bio, email, created_at, updated_at
)
SELECT 
  id, license_number, brokerage_name, brokerage_license,
  years_experience, specializations, phone, website, bio, email, created_at, updated_at
FROM public.buyer_agent_profiles
ON CONFLICT (id) DO NOTHING;

-- Step 4: Migrate data from seller_agent_profiles to agent_profiles
-- Use COALESCE to merge data if agent already exists from buyer_agent_profiles
INSERT INTO public.agent_profiles (
  id, license_number, brokerage_name, brokerage_license,
  years_experience, specializations, commission_rate, phone, website, bio, email, created_at, updated_at
)
SELECT 
  seller_agent_profiles.id, 
  COALESCE(agent_profiles.license_number, seller_agent_profiles.license_number),
  COALESCE(agent_profiles.brokerage_name, seller_agent_profiles.brokerage_name),
  COALESCE(agent_profiles.brokerage_license, seller_agent_profiles.brokerage_license),
  COALESCE(agent_profiles.years_experience, seller_agent_profiles.years_experience),
  COALESCE(agent_profiles.specializations, seller_agent_profiles.specializations),
  COALESCE(agent_profiles.commission_rate, seller_agent_profiles.commission_rate),
  COALESCE(agent_profiles.phone, seller_agent_profiles.phone),
  COALESCE(agent_profiles.website, seller_agent_profiles.website),
  COALESCE(agent_profiles.bio, seller_agent_profiles.bio),
  COALESCE(agent_profiles.email, seller_agent_profiles.email),
  LEAST(COALESCE(agent_profiles.created_at, seller_agent_profiles.created_at), seller_agent_profiles.created_at),
  GREATEST(COALESCE(agent_profiles.updated_at, seller_agent_profiles.updated_at), seller_agent_profiles.updated_at)
FROM public.seller_agent_profiles
LEFT JOIN public.agent_profiles ON seller_agent_profiles.id = agent_profiles.id
ON CONFLICT (id) DO UPDATE SET
  license_number = COALESCE(EXCLUDED.license_number, agent_profiles.license_number),
  brokerage_name = COALESCE(EXCLUDED.brokerage_name, agent_profiles.brokerage_name),
  brokerage_license = COALESCE(EXCLUDED.brokerage_license, agent_profiles.brokerage_license),
  years_experience = COALESCE(EXCLUDED.years_experience, agent_profiles.years_experience),
  specializations = COALESCE(EXCLUDED.specializations, agent_profiles.specializations),
  commission_rate = COALESCE(EXCLUDED.commission_rate, agent_profiles.commission_rate),
  phone = COALESCE(EXCLUDED.phone, agent_profiles.phone),
  website = COALESCE(EXCLUDED.website, agent_profiles.website),
  bio = COALESCE(EXCLUDED.bio, agent_profiles.bio),
  email = COALESCE(EXCLUDED.email, agent_profiles.email),
  updated_at = NOW();

-- Step 5: Update profiles table: change buyer_agent and seller_agent roles to 'agent'
UPDATE public.profiles
SET role = 'agent'
WHERE role IN ('buyer_agent', 'seller_agent');

-- Step 6: Enable RLS on agent_profiles
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for agent_profiles (similar to the old agent tables)
DROP POLICY IF EXISTS "Users can view their own agent profile" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can update their own agent profile" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can insert their own agent profile" ON public.agent_profiles;

CREATE POLICY "Users can view their own agent profile" ON public.agent_profiles
  FOR SELECT USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update their own agent profile" ON public.agent_profiles
  FOR UPDATE USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can insert their own agent profile" ON public.agent_profiles
  FOR INSERT WITH CHECK (auth.uid()::TEXT = id);

-- Step 8: Add comment
COMMENT ON TABLE public.agent_profiles IS 'Unified profile information for agents (replaces buyer_agent_profiles and seller_agent_profiles)';
