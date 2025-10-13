-- Add agent information columns to buyer_profiles and seller_profiles tables
-- This allows buyers and sellers to store their agent's contact information

-- Add agent columns to buyer_profiles
ALTER TABLE public.buyer_profiles 
ADD COLUMN IF NOT EXISTS agent_name TEXT,
ADD COLUMN IF NOT EXISTS agent_email TEXT,
ADD COLUMN IF NOT EXISTS agent_phone TEXT;

-- Add agent columns to seller_profiles  
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS agent_name TEXT,
ADD COLUMN IF NOT EXISTS agent_email TEXT,
ADD COLUMN IF NOT EXISTS agent_phone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.buyer_profiles.agent_name IS 'Name of the buyer''s real estate agent';
COMMENT ON COLUMN public.buyer_profiles.agent_email IS 'Email address of the buyer''s real estate agent';
COMMENT ON COLUMN public.buyer_profiles.agent_phone IS 'Phone number of the buyer''s real estate agent';

COMMENT ON COLUMN public.seller_profiles.agent_name IS 'Name of the seller''s real estate agent';
COMMENT ON COLUMN public.seller_profiles.agent_email IS 'Email address of the seller''s real estate agent';
COMMENT ON COLUMN public.seller_profiles.agent_phone IS 'Phone number of the seller''s real estate agent';
