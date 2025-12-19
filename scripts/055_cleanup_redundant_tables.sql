-- Migration 055: Clean up redundant tables
-- Removes tables that are no longer needed after consolidating agent roles

-- Step 1: Drop old agent profile tables (replaced by unified agent_profiles)
DROP TABLE IF EXISTS public.buyer_agent_profiles CASCADE;
DROP TABLE IF EXISTS public.seller_agent_profiles CASCADE;

-- Step 2: Drop unused relationship tables
-- These tables were created but never actually used in the codebase.
-- Agent-client relationships are tracked via agent_email in buyer_profiles/seller_profiles
-- Agent-property relationships are tracked via seller_id in properties table
DROP TABLE IF EXISTS public.agent_clients CASCADE;
DROP TABLE IF EXISTS public.agent_properties CASCADE;

-- Step 3: Drop any other potentially redundant relationship tables (if they exist)
DROP TABLE IF EXISTS public.agent_buyer_relationships CASCADE;
DROP TABLE IF EXISTS public.agent_listing_relationships CASCADE;

-- Step 4: Update agent_properties constraint if it still exists (should be dropped above, but just in case)
-- This constraint references old agent types that no longer exist
DO $$ 
BEGIN
  -- Check if constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'agent_properties_agent_type_check' 
    AND table_name = 'agent_properties'
  ) THEN
    ALTER TABLE public.agent_properties DROP CONSTRAINT agent_properties_agent_type_check;
  END IF;
END $$;

-- Step 5: Clean up any remaining references
-- Note: The old dashboard pages (buyer_agent/page.tsx and seller_agent/page.tsx) 
-- have been removed and replaced with the unified agent dashboard

-- Step 6: Add comment documenting the cleanup
COMMENT ON TABLE public.agent_profiles IS 'Unified profile information for agents. Replaces buyer_agent_profiles and seller_agent_profiles.';
