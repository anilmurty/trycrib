-- Add missing 'status' column to properties table
-- This column is needed for the property import system

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Update existing properties to have 'active' status
UPDATE public.properties 
SET status = 'active' 
WHERE status IS NULL;
