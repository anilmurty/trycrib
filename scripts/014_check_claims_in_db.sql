-- Check what claims are actually in the database
-- Run this in Supabase SQL Editor to see what's there

-- Check all claims
SELECT 
  id,
  property_id,
  claimant_id,
  claim_status,
  claim_reason,
  created_at
FROM public.property_claims 
ORDER BY created_at DESC;

-- Check claims for the specific property
SELECT 
  id,
  property_id,
  claimant_id,
  claim_status,
  claim_reason,
  created_at
FROM public.property_claims 
WHERE property_id = '1a242af3-aa0e-4459-8f8f-95800f7e5b90';

-- Check if the property exists and its details
SELECT 
  id,
  title,
  is_seed_property,
  seller_id,
  created_at
FROM public.properties 
WHERE id = '1a242af3-aa0e-4459-8f8f-95800f7e5b90';
