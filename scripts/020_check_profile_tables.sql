-- Check if buyer_profiles and seller_profiles tables exist and their structure

-- Check if buyer_profiles table exists
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'buyer_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if seller_profiles table exists
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'seller_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if profiles table exists and its structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on these tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'buyer_profiles', 'seller_profiles')
ORDER BY tablename, policyname;
