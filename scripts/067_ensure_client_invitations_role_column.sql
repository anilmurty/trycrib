-- Migration 067: Ensure role column exists in client_invitations table
-- This fixes the PGRST204 error where PostgREST can't find the role column

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'client_invitations' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.client_invitations 
    ADD COLUMN role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller'));
    
    -- Update existing records to have buyer role
    UPDATE public.client_invitations 
    SET role = 'buyer' 
    WHERE role IS NULL;
  END IF;
END $$;

-- Ensure all indexes exist
CREATE INDEX IF NOT EXISTS idx_client_invitations_agent_id ON public.client_invitations(agent_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_email ON public.client_invitations(email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON public.client_invitations(status);
CREATE INDEX IF NOT EXISTS idx_client_invitations_invited_at ON public.client_invitations(invited_at);
CREATE INDEX IF NOT EXISTS idx_client_invitations_role ON public.client_invitations(role);

-- Note: After running this migration, you may need to refresh PostgREST's schema cache
-- In Supabase, this can be done by:
-- 1. Going to Database > API Settings
-- 2. Clicking "Reload schema" or restarting the PostgREST service
-- Or it will refresh automatically after a short period
