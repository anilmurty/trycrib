-- Check the current user's profile and role
-- This will help us understand why onboarding isn't being reached

-- Check all profiles to see current users
SELECT 
  id,
  email,
  full_name,
  role,
  verification_status,
  created_at,
  updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- Check if there are any users without roles
SELECT 
  id,
  email,
  full_name,
  role,
  verification_status
FROM public.profiles
WHERE role IS NULL OR role = '';

-- Check buyer_profiles table
SELECT 
  id,
  created_at,
  updated_at
FROM public.buyer_profiles
ORDER BY created_at DESC;

-- Check seller_profiles table  
SELECT 
  id,
  created_at,
  updated_at
FROM public.seller_profiles
ORDER BY created_at DESC;
