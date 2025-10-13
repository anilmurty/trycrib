-- Add email addresses to buyer_profiles and seller_profiles tables
-- This will make it easier to identify and delete test users

-- Add email column to buyer_profiles
ALTER TABLE public.buyer_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to seller_profiles  
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to seller_agent_profiles
ALTER TABLE public.seller_agent_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to buyer_agent_profiles
ALTER TABLE public.buyer_agent_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing records with email addresses from the main profiles table
UPDATE public.buyer_profiles 
SET email = p.email
FROM public.profiles p 
WHERE buyer_profiles.id = p.id 
AND buyer_profiles.email IS NULL;

UPDATE public.seller_profiles 
SET email = p.email
FROM public.profiles p 
WHERE seller_profiles.id = p.id 
AND seller_profiles.email IS NULL;

-- For agent profiles, we'll update them when they're created
-- But let's also update any existing ones
UPDATE public.seller_agent_profiles 
SET email = p.email
FROM public.profiles p 
WHERE seller_agent_profiles.id = p.id 
AND seller_agent_profiles.email IS NULL;

UPDATE public.buyer_agent_profiles 
SET email = p.email
FROM public.profiles p 
WHERE buyer_agent_profiles.id = p.id 
AND buyer_agent_profiles.email IS NULL;
