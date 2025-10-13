-- Remove verification system from database
-- This script removes all verification-related columns, tables, and types

-- Drop verification-related tables if they exist
DROP TABLE IF EXISTS public.verification_documents CASCADE;
DROP TABLE IF EXISTS public.buyer_verifications CASCADE;
DROP TABLE IF EXISTS public.seller_verifications CASCADE;

-- Remove verification_status column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS verification_status;

-- Remove verification_status column from properties table  
ALTER TABLE public.properties DROP COLUMN IF EXISTS verification_status;

-- Drop verification_status enum type
DROP TYPE IF EXISTS verification_status CASCADE;

-- Drop verification-related indexes
DROP INDEX IF EXISTS idx_properties_verification_status;
DROP INDEX IF EXISTS idx_verification_documents_user_id;
DROP INDEX IF EXISTS idx_verification_documents_created_at;
DROP INDEX IF EXISTS idx_buyer_verifications_user_id;
DROP INDEX IF EXISTS idx_seller_verifications_user_id;

-- Note: This script removes the verification system completely
-- Verification will now be handled by agents instead of automated system
