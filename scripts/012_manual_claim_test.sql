-- Manual test to insert a claim directly, bypassing the function
-- This will help us see if there are any constraint issues

-- First, let's see what's in the property_claims table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'property_claims' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Try to insert a claim manually
INSERT INTO public.property_claims (
  property_id, 
  claimant_id, 
  claim_reason,
  claim_status
) VALUES (
  '1a242af3-aa0e-4459-8f8f-95800f7e5b90'::UUID, 
  'user_33f20uvuyi5xTYfRd7ih5OCpIbK', 
  'Manual test claim',
  'pending'
);

-- Check if the insert worked
SELECT * FROM public.property_claims 
WHERE property_id = '1a242af3-aa0e-4459-8f8f-95800f7e5b90';

-- Clean up the test claim
DELETE FROM public.property_claims 
WHERE property_id = '1a242af3-aa0e-4459-8f8f-95800f7e5b90' 
AND claimant_id = 'user_33f20uvuyi5xTYfRd7ih5OCpIbK';
