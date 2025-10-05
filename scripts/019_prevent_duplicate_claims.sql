-- Update the claim_property function to prevent duplicate claims
-- This will check if the same user has already claimed the same property

DROP FUNCTION IF EXISTS claim_property(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION claim_property(
  target_property_id UUID,
  claimant_user_id TEXT,
  claim_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  property_exists BOOLEAN;
  claim_exists BOOLEAN;
  user_has_claimed BOOLEAN;
BEGIN
  -- Check if property exists
  SELECT EXISTS(
    SELECT 1 FROM public.properties 
    WHERE id = target_property_id
  ) INTO property_exists;
  
  IF NOT property_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if this specific user has already claimed this specific property
  SELECT EXISTS(
    SELECT 1 FROM public.property_claims 
    WHERE property_id = target_property_id 
    AND claimant_id = claimant_user_id
  ) INTO user_has_claimed;
  
  IF user_has_claimed THEN
    RETURN FALSE; -- User has already claimed this property
  END IF;
  
  -- Check if ANY user has already claimed this property (for seed properties)
  SELECT EXISTS(
    SELECT 1 FROM public.property_claims 
    WHERE property_id = target_property_id
  ) INTO claim_exists;
  
  IF claim_exists THEN
    RETURN FALSE; -- Property has already been claimed by someone else
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
