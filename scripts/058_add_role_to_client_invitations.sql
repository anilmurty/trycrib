-- Add role column to client_invitations table if it doesn't exist
ALTER TABLE public.client_invitations 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller'));

-- Update existing records to have buyer role if they don't have one
UPDATE public.client_invitations 
SET role = 'buyer' 
WHERE role IS NULL OR role NOT IN ('buyer', 'seller');
