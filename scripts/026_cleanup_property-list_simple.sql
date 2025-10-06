-- Simple cleanup script for Supabase Dashboard
-- Run this in the SQL Editor in your Supabase dashboard

-- Clean up property claims first (they reference properties)
DELETE FROM public.property_claims;

-- Clean up property imports
DELETE FROM public.property_imports;

-- Clean up all properties
DELETE FROM public.properties;

-- Verify the cleanup worked
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
  'Profiles' as table_name, COUNT(*) as count FROM public.profiles;

-- Show success message
SELECT '✅ Cleanup completed! All property data has been removed.' as message;
