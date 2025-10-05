-- Test script to check property and claims status
-- Run this to see what's in the database

-- Check the specific property
SELECT 
  id, 
  title, 
  is_seed_property, 
  seller_id,
  created_at
FROM public.properties 
WHERE id = '1a242af3-aa0e-4459-8f8f-95800f7e5b90';

-- Check existing claims for this property
SELECT 
  id,
  property_id,
  claimant_id,
  claim_status,
  claim_reason,
  created_at
FROM public.property_claims 
WHERE property_id = '1a242af3-aa0e-4459-8f8f-95800f7e5b90';

-- Check all claims in the system
SELECT 
  id,
  property_id,
  claimant_id,
  claim_status,
  created_at
FROM public.property_claims 
ORDER BY created_at DESC;

-- Test the function directly
SELECT claim_property(
  '1a242af3-aa0e-4459-8f8f-95800f7e5b90'::UUID,
  'user_33f20uvuyi5xTYfRd7ih5OCpIbK',
  'Test claim from SQL'
);
