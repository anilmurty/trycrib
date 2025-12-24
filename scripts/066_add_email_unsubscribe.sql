-- Migration 066: Add email unsubscribe functionality
-- Add email_unsubscribed column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false;

-- Add unsubscribe_token column for secure unsubscribe links
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Create index on unsubscribe_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_unsubscribe_token ON public.profiles(unsubscribe_token);

-- Generate unsubscribe tokens for existing users (using a hash of their email + id)
UPDATE public.profiles
SET unsubscribe_token = encode(digest(id || email || 'trycrib-unsubscribe-secret', 'sha256'), 'hex')
WHERE unsubscribe_token IS NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.email_unsubscribed IS 'Whether the user has unsubscribed from marketing emails';
COMMENT ON COLUMN public.profiles.unsubscribe_token IS 'Unique token for unsubscribe links';
