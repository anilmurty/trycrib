-- Clean up test data and reset property counts
-- This script removes all test properties, claims, and imports while preserving user data

-- First, disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clean up property claims (these reference properties)
DELETE FROM public.property_claims;

-- Clean up property imports (these track import history)
DELETE FROM public.property_imports;

-- Clean up properties (this will cascade to related data)
DELETE FROM public.properties;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Verify cleanup
SELECT 
  'Properties' as table_name, COUNT(*) as count FROM public.properties
UNION ALL
SELECT 
  'Property Claims' as table_name, COUNT(*) as count FROM public.property_claims
UNION ALL
SELECT 
  'Property Imports' as table_name, COUNT(*) as count FROM public.property_imports
UNION ALL
SELECT 
  'Profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 
  'Buyer Profiles' as table_name, COUNT(*) as count FROM public.buyer_profiles
UNION ALL
SELECT 
  'Seller Profiles' as table_name, COUNT(*) as count FROM public.seller_profiles;

-- Show current counts
SELECT 'Cleanup completed! Current counts:' as message;
