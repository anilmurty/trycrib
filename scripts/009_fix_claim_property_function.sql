-- Fix the claim_property function to check for any existing claims on the property
-- instead of just claims by the same user

DROP FUNCTION IF EXISTS claim_property(UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION claim_property(
  target_property_id UUID,
  claimant_user_id TEXT,
  claim_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  property_exists BOOLEAN;
  claim_exists BOOLEAN;
BEGIN
  -- Check if property exists and is a seed property
  SELECT EXISTS(
    SELECT 1 FROM public.properties 
    WHERE id = target_property_id 
    AND is_seed_property = true
  ) INTO property_exists;
  
  IF NOT property_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if claim already exists for this property (by anyone)
  SELECT EXISTS(
    SELECT 1 FROM public.property_claims 
    WHERE property_id = target_property_id
  ) INTO claim_exists;
  
  IF claim_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Create the claim
  INSERT INTO public.property_claims (
    property_id, 
    claimant_id, 
    claim_reason,
    claim_status
  ) VALUES (
    target_property_id, 
    claimant_user_id, 
    claim_reason,
    'pending'
  );
  
  RETURN TRUE;
END;
$$;
