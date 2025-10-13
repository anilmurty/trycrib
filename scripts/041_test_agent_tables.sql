-- Test script to verify agent tables and data
-- Run this in Supabase dashboard to check if everything is working

-- 1. Check if agent tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'seller_agent_profiles', 
  'buyer_agent_profiles', 
  'agent_properties', 
  'agent_clients'
)
ORDER BY table_name;

-- 2. Check if user_role enum has the new values
SELECT unnest(enum_range(NULL::user_role)) as role_values;

-- 3. Check current profiles and their roles
SELECT 
  id,
  email,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are any agent profiles
SELECT 
  'seller_agent_profiles' as table_name,
  COUNT(*) as record_count
FROM public.seller_agent_profiles
UNION ALL
SELECT 
  'buyer_agent_profiles' as table_name,
  COUNT(*) as record_count
FROM public.buyer_agent_profiles
UNION ALL
SELECT 
  'agent_properties' as table_name,
  COUNT(*) as record_count
FROM public.agent_properties
UNION ALL
SELECT 
  'agent_clients' as table_name,
  COUNT(*) as record_count
FROM public.agent_clients;

-- 5. Check RLS policies are enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'seller_agent_profiles', 
  'buyer_agent_profiles', 
  'agent_properties', 
  'agent_clients'
)
ORDER BY tablename;
