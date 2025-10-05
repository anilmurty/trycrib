-- Fix foreign key relationships for property_claims table
-- The issue is that claimant_id is TEXT (Clerk ID) but there's no FK to profiles table

-- Add foreign key constraint for claimant_id -> profiles.id
ALTER TABLE public.property_claims 
ADD CONSTRAINT fk_property_claims_claimant_id 
FOREIGN KEY (claimant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for reviewed_by -> profiles.id (if not already exists)
ALTER TABLE public.property_claims 
ADD CONSTRAINT fk_property_claims_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Note: This will only work if all claimant_id values in property_claims 
-- correspond to existing profiles.id values
