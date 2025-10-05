-- Check if all claimant_id values in property_claims have corresponding profiles
-- This will help us understand if we can safely add foreign key constraints

-- Check for orphaned claims (claims without corresponding profiles)
SELECT 
  pc.claimant_id,
  pc.property_id,
  pc.claim_status,
  pc.created_at
FROM public.property_claims pc
LEFT JOIN public.profiles p ON pc.claimant_id = p.id
WHERE p.id IS NULL;

-- Check all claims and their corresponding profiles
SELECT 
  pc.id as claim_id,
  pc.claimant_id,
  pc.claim_status,
  p.full_name,
  p.email,
  p.role
FROM public.property_claims pc
LEFT JOIN public.profiles p ON pc.claimant_id = p.id
ORDER BY pc.created_at DESC;

-- Check all profiles to see what claimant_ids exist
SELECT 
  id,
  full_name,
  email,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
