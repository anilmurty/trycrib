-- Add confirmation_email_sent flag to track if confirmation email was sent
ALTER TABLE public.client_invitations 
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_client_invitations_confirmation_email_sent ON public.client_invitations(confirmation_email_sent);
