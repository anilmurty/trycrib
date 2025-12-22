-- Migration 065: Add agent confirmation status to buyer_profiles and seller_profiles
-- This allows tracking whether a buyer/seller has confirmed their agent relationship

-- Add agent_confirmed column to buyer_profiles
ALTER TABLE public.buyer_profiles 
ADD COLUMN IF NOT EXISTS agent_confirmed BOOLEAN DEFAULT false;

-- Add agent_confirmed column to seller_profiles  
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS agent_confirmed BOOLEAN DEFAULT false;

-- Set agent_confirmed to true for existing records where agent info exists
-- This assumes existing agent relationships are already confirmed
UPDATE public.buyer_profiles 
SET agent_confirmed = true 
WHERE agent_email IS NOT NULL AND agent_confirmed = false;

UPDATE public.seller_profiles 
SET agent_confirmed = true 
WHERE agent_email IS NOT NULL AND agent_confirmed = false;

-- Add comments for documentation
COMMENT ON COLUMN public.buyer_profiles.agent_confirmed IS 'Whether the buyer has confirmed their agent relationship';
COMMENT ON COLUMN public.seller_profiles.agent_confirmed IS 'Whether the seller has confirmed their agent relationship';
