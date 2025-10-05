-- Create initial superadmin
-- This script promotes the first user to superadmin role
-- Run this after running 005_add_superadmin_role.sql

-- Get the first user and promote them to superadmin
DO $$
DECLARE
    first_user_id TEXT;
    first_user_email TEXT;
BEGIN
    -- Get the first user
    SELECT id, email INTO first_user_id, first_user_email
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Check if we found a user
    IF first_user_id IS NOT NULL THEN
        -- Promote to superadmin
        UPDATE public.profiles 
        SET role = 'superadmin', updated_at = NOW()
        WHERE id = first_user_id;
        
        -- Log the promotion
        INSERT INTO public.role_changes (user_id, old_role, new_role, changed_by, reason)
        VALUES (first_user_id, 'buyer', 'superadmin', first_user_id, 'Initial superadmin setup');
        
        RAISE NOTICE 'Promoted user % (%) to superadmin', first_user_email, first_user_id;
    ELSE
        RAISE NOTICE 'No users found to promote to superadmin';
    END IF;
END $$;
