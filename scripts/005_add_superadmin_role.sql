-- Add superadmin role to user_role enum
-- This script adds the superadmin role to the existing user_role enum

-- Add superadmin to the user_role enum
ALTER TYPE user_role ADD VALUE 'superadmin';

-- Update the admin page access to include superadmin
-- (This will be handled in the application code)

-- Create a function to get the first user (for initial superadmin setup)
CREATE OR REPLACE FUNCTION get_first_user()
RETURNS TABLE(user_id UUID, email TEXT, full_name TEXT)
LANGUAGE SQL
AS $$
  SELECT id, email, full_name 
  FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1;
$$;

-- Create a function to promote a user to superadmin
CREATE OR REPLACE FUNCTION promote_to_superadmin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's role to superadmin
  UPDATE public.profiles 
  SET role = 'superadmin', updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Return true if the update was successful
  RETURN FOUND;
END;
$$;

-- Create a function to promote a user to admin (superadmin only)
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id UUID, promoted_by UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  promoter_role user_role;
BEGIN
  -- Check if the promoter is a superadmin
  SELECT role INTO promoter_role 
  FROM public.profiles 
  WHERE id = promoted_by;
  
  -- Only superadmins can promote users to admin
  IF promoter_role != 'superadmin' THEN
    RETURN FALSE;
  END IF;
  
  -- Update the user's role to admin
  UPDATE public.profiles 
  SET role = 'admin', updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Return true if the update was successful
  RETURN FOUND;
END;
$$;

-- Create a function to demote an admin (superadmin only)
CREATE OR REPLACE FUNCTION demote_admin(target_user_id UUID, demoted_by UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demoter_role user_role;
  target_role user_role;
BEGIN
  -- Check if the demoter is a superadmin
  SELECT role INTO demoter_role 
  FROM public.profiles 
  WHERE id = demoted_by;
  
  -- Check the target user's current role
  SELECT role INTO target_role 
  FROM public.profiles 
  WHERE id = target_user_id;
  
  -- Only superadmins can demote admins, and can't demote other superadmins
  IF demoter_role != 'superadmin' OR target_role = 'superadmin' THEN
    RETURN FALSE;
  END IF;
  
  -- Demote to buyer (default role)
  UPDATE public.profiles 
  SET role = 'buyer', updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Return true if the update was successful
  RETURN FOUND;
END;
$$;

-- Create role change history table
CREATE TABLE IF NOT EXISTS public.role_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for role changes
CREATE INDEX IF NOT EXISTS idx_role_changes_user_id ON public.role_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_role_changes_changed_by ON public.role_changes(changed_by);
CREATE INDEX IF NOT EXISTS idx_role_changes_created_at ON public.role_changes(created_at);

-- Enable RLS on role_changes table
ALTER TABLE public.role_changes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for role_changes (only admins and superadmins can view)
CREATE POLICY "Admins can view role changes"
  ON public.role_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Create RLS policy for role_changes (only superadmins can insert)
CREATE POLICY "Superadmins can insert role changes"
  ON public.role_changes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );
