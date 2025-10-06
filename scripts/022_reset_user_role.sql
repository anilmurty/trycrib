-- Reset user role to force them back to onboarding
-- This will remove the role from the profiles table and related profile tables

-- First, let's see what users exist
SELECT 
  id,
  email,
  full_name,
  role,
  verification_status
FROM public.profiles
ORDER BY created_at DESC;

-- Temporarily allow NULL values in role column
ALTER TABLE public.profiles ALTER COLUMN role DROP NOT NULL;

-- Remove role from profiles table (set to NULL)
UPDATE public.profiles 
SET role = NULL, updated_at = NOW()
WHERE role IS NOT NULL;

-- Remove from buyer_profiles table
DELETE FROM public.buyer_profiles;

-- Remove from seller_profiles table  
DELETE FROM public.seller_profiles;

-- Check the result
SELECT 
  id,
  email,
  full_name,
  role,
  verification_status,
  updated_at
FROM public.profiles
ORDER BY created_at DESC;
