-- Check the actual current schema to understand the data types
-- This will help us determine if profiles.id is UUID or TEXT

-- Check the data type of the profiles.id column
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data from profiles table to see actual ID format
SELECT 
    id,
    email,
    role,
    created_at
FROM public.profiles
LIMIT 5;

-- Check if there are any existing foreign key constraints on profiles.id
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'profiles'
AND kcu.column_name = 'id';
