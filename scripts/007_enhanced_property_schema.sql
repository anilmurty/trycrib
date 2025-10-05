-- Enhanced Property Schema for Property Data Management System
-- This script adds rich property data fields to support feed imports and property claiming

-- Add new columns to the existing properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS year_built INTEGER,
ADD COLUMN IF NOT EXISTS lot_acres DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS hoa_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS mls_id TEXT,
ADD COLUMN IF NOT EXISTS source_feed_id TEXT,
ADD COLUMN IF NOT EXISTS list_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS days_on_market INTEGER,
ADD COLUMN IF NOT EXISTS is_seed_property BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_feed_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_user_update TIMESTAMPTZ;

-- Allow seller_id to be NULL for seed properties
ALTER TABLE public.properties 
ALTER COLUMN seller_id DROP NOT NULL;

-- Add rich data fields as JSONB for flexible property information
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_features JSONB,
ADD COLUMN IF NOT EXISTS location_community JSONB,
ADD COLUMN IF NOT EXISTS building_info JSONB,
ADD COLUMN IF NOT EXISTS lot_info JSONB,
ADD COLUMN IF NOT EXISTS interior_features JSONB,
ADD COLUMN IF NOT EXISTS original_image_urls TEXT[];

-- Create property imports table for tracking feed imports
CREATE TABLE IF NOT EXISTS public.property_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id TEXT NOT NULL,
  import_type TEXT NOT NULL, -- 'feed', 'manual', 'bulk'
  source_file TEXT,
  properties_processed INTEGER DEFAULT 0,
  properties_created INTEGER DEFAULT 0,
  properties_updated INTEGER DEFAULT 0,
  properties_errors INTEGER DEFAULT 0,
  import_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'success', 'partial', 'failed'
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property claims table for tracking property ownership claims
CREATE TABLE IF NOT EXISTS public.property_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  claimant_id TEXT NOT NULL, -- Clerk user ID
  claim_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  claim_reason TEXT,
  verification_notes TEXT,
  reviewed_by TEXT, -- Admin who reviewed the claim
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_mls_id ON public.properties(mls_id);
CREATE INDEX IF NOT EXISTS idx_properties_source_feed_id ON public.properties(source_feed_id);
CREATE INDEX IF NOT EXISTS idx_properties_is_seed_property ON public.properties(is_seed_property);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_list_date ON public.properties(list_date);

CREATE INDEX IF NOT EXISTS idx_property_imports_admin_id ON public.property_imports(admin_id);
CREATE INDEX IF NOT EXISTS idx_property_imports_import_type ON public.property_imports(import_type);
CREATE INDEX IF NOT EXISTS idx_property_imports_created_at ON public.property_imports(created_at);

CREATE INDEX IF NOT EXISTS idx_property_claims_property_id ON public.property_claims(property_id);
CREATE INDEX IF NOT EXISTS idx_property_claims_claimant_id ON public.property_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_property_claims_claim_status ON public.property_claims(claim_status);

-- Enable RLS on new tables
ALTER TABLE public.property_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_imports (only admins and superadmins can view)
DROP POLICY IF EXISTS "Admins can view property imports" ON public.property_imports;
CREATE POLICY "Admins can view property imports"
  ON public.property_imports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid()::TEXT 
      AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can insert property imports" ON public.property_imports;
CREATE POLICY "Admins can insert property imports"
  ON public.property_imports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid()::TEXT 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS policies for property_claims (sellers can view their own claims, admins can view all)
DROP POLICY IF EXISTS "Users can view own property claims" ON public.property_claims;
CREATE POLICY "Users can view own property claims"
  ON public.property_claims FOR SELECT
  USING (
    claimant_id = auth.uid()::TEXT OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid()::TEXT 
      AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Sellers can insert property claims" ON public.property_claims;
CREATE POLICY "Sellers can insert property claims"
  ON public.property_claims FOR INSERT
  WITH CHECK (
    claimant_id = auth.uid()::TEXT AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid()::TEXT 
      AND role = 'seller'
    )
  );

DROP POLICY IF EXISTS "Admins can update property claims" ON public.property_claims;
CREATE POLICY "Admins can update property claims"
  ON public.property_claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid()::TEXT 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create function to get properties by address (for property claiming)
DROP FUNCTION IF EXISTS get_properties_by_address(TEXT);
CREATE OR REPLACE FUNCTION get_properties_by_address(search_address TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  listing_price INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  is_seed_property BOOLEAN,
  seller_id TEXT
)
LANGUAGE SQL
AS $$
  SELECT 
    p.id,
    p.title,
    p.address,
    p.city,
    p.state,
    p.zip_code,
    p.listing_price,
    p.bedrooms,
    p.bathrooms,
    p.square_feet,
    p.is_seed_property,
    p.seller_id
  FROM public.properties p
  WHERE LOWER(p.address) LIKE LOWER('%' || search_address || '%')
  AND p.is_active = true
  ORDER BY p.created_at DESC;
$$;

-- Create function to claim a property
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
  
  -- Check if claim already exists
  SELECT EXISTS(
    SELECT 1 FROM public.property_claims 
    WHERE property_id = target_property_id 
    AND claimant_id = claimant_user_id
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

-- Create function to approve a property claim
DROP FUNCTION IF EXISTS approve_property_claim(UUID, TEXT);
CREATE OR REPLACE FUNCTION approve_property_claim(
  claim_id UUID,
  approved_by TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claim_record RECORD;
  is_admin BOOLEAN;
BEGIN
  -- Check if the approver is an admin or superadmin
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = approved_by 
    AND role IN ('admin', 'superadmin')
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN FALSE;
  END IF;
  
  -- Get the claim details
  SELECT * INTO claim_record 
  FROM public.property_claims 
  WHERE id = claim_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the claim status
  UPDATE public.property_claims 
  SET 
    claim_status = 'approved',
    reviewed_by = approved_by,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = claim_id;
  
  -- Transfer the property from seed to the claimant
  UPDATE public.properties 
  SET 
    seller_id = claim_record.claimant_id,
    is_seed_property = false,
    updated_at = NOW()
  WHERE id = claim_record.property_id;
  
  RETURN TRUE;
END;
$$;
