-- Create client invitations table to track invitations sent by agents
CREATE TABLE IF NOT EXISTS public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_invitations_agent_id ON public.client_invitations(agent_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_email ON public.client_invitations(email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON public.client_invitations(status);
CREATE INDEX IF NOT EXISTS idx_client_invitations_invited_at ON public.client_invitations(invited_at);

-- Enable RLS
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Agents can view their own invitations" ON public.client_invitations
  FOR SELECT USING (auth.uid()::TEXT = agent_id);

CREATE POLICY "Agents can insert their own invitations" ON public.client_invitations
  FOR INSERT WITH CHECK (auth.uid()::TEXT = agent_id);

CREATE POLICY "Agents can update their own invitations" ON public.client_invitations
  FOR UPDATE USING (auth.uid()::TEXT = agent_id);

-- Allow admins to view all invitations
CREATE POLICY "Admins can view all invitations" ON public.client_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::TEXT
      AND profiles.role IN ('admin', 'superadmin')
    )
  );
