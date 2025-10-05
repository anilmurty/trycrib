-- Debug version of claim_property function with detailed logging
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
  property_record RECORD;
  claim_count INTEGER;
BEGIN
  -- Get property details for debugging
  SELECT * INTO property_record FROM public.properties WHERE id = target_property_id;
  
  -- Log property details
  RAISE NOTICE 'Property check: id=%, is_seed_property=%, seller_id=%', 
    property_record.id, property_record.is_seed_property, property_record.seller_id;
  
  -- Check if property exists and is a seed property
  SELECT EXISTS(
    SELECT 1 FROM public.properties 
    WHERE id = target_property_id 
    AND is_seed_property = true
  ) INTO property_exists;
  
  RAISE NOTICE 'Property exists check: %', property_exists;
  
  IF NOT property_exists THEN
    RAISE NOTICE 'Property does not exist or is not a seed property';
    RETURN FALSE;
  END IF;
  
  -- Check existing claims count
  SELECT COUNT(*) INTO claim_count FROM public.property_claims WHERE property_id = target_property_id;
  RAISE NOTICE 'Existing claims count: %', claim_count;
  
  -- Check if claim already exists for this property
  SELECT EXISTS(
    SELECT 1 FROM public.property_claims 
    WHERE property_id = target_property_id
  ) INTO claim_exists;
  
  RAISE NOTICE 'Claim exists check: %', claim_exists;
  
  IF claim_exists THEN
    RAISE NOTICE 'Claim already exists for this property';
    RETURN FALSE;
  END IF;
  
  -- Create the claim
  RAISE NOTICE 'Creating claim for property % by user %', target_property_id, claimant_user_id;
  
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
  
  RAISE NOTICE 'Claim created successfully';
  RETURN TRUE;
END;
$$;
