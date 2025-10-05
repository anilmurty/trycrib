-- Simplified claim_property function with minimal logic
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
BEGIN
  -- Just try to insert the claim directly
  -- Let the database constraints handle validation
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
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return false
    RAISE NOTICE 'Error in claim_property: %', SQLERRM;
    RETURN FALSE;
END;
$$;
