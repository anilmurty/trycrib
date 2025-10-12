-- Add agent roles to user_role enum
-- This script adds seller_agent and buyer_agent roles to the existing user_role enum

-- Add agent roles to the user_role enum
ALTER TYPE user_role ADD VALUE 'seller_agent';
ALTER TYPE user_role ADD VALUE 'buyer_agent';

-- Create seller_agent_profiles table (additional seller agent-specific info)
CREATE TABLE IF NOT EXISTS public.seller_agent_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  brokerage_name TEXT,
  brokerage_license TEXT,
  years_experience INTEGER,
  specializations TEXT[],
  commission_rate DECIMAL(5,2) DEFAULT 2.50,
  phone TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create buyer_agent_profiles table (additional buyer agent-specific info)
CREATE TABLE IF NOT EXISTS public.buyer_agent_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  brokerage_name TEXT,
  brokerage_license TEXT,
  years_experience INTEGER,
  specializations TEXT[],
  phone TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_properties table (links agents to properties they manage)
CREATE TABLE IF NOT EXISTS public.agent_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_type user_role NOT NULL CHECK (agent_type IN ('seller_agent', 'buyer_agent')),
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, property_id, agent_type)
);

-- Create agent_clients table (links buyer agents to their clients)
CREATE TABLE IF NOT EXISTS public.agent_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'buyer_agent_client',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, client_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_properties_agent_id ON public.agent_properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_properties_property_id ON public.agent_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_agent_clients_agent_id ON public.agent_clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_clients_client_id ON public.agent_clients(client_id);

-- Add RLS policies for agent tables
ALTER TABLE public.seller_agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for seller_agent_profiles
CREATE POLICY "Users can view their own seller agent profile" ON public.seller_agent_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own seller agent profile" ON public.seller_agent_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own seller agent profile" ON public.seller_agent_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for buyer_agent_profiles
CREATE POLICY "Users can view their own buyer agent profile" ON public.buyer_agent_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own buyer agent profile" ON public.buyer_agent_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own buyer agent profile" ON public.buyer_agent_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for agent_properties
CREATE POLICY "Agents can view their own property assignments" ON public.agent_properties
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own property assignments" ON public.agent_properties
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own property assignments" ON public.agent_properties
  FOR UPDATE USING (auth.uid() = agent_id);

-- RLS policies for agent_clients
CREATE POLICY "Agents can view their own client relationships" ON public.agent_clients
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Clients can view their agent relationships" ON public.agent_clients
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Agents can insert their own client relationships" ON public.agent_clients
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- Add comments for documentation
COMMENT ON TABLE public.seller_agent_profiles IS 'Additional profile information for seller agents';
COMMENT ON TABLE public.buyer_agent_profiles IS 'Additional profile information for buyer agents';
COMMENT ON TABLE public.agent_properties IS 'Links agents to properties they manage';
COMMENT ON TABLE public.agent_clients IS 'Links buyer agents to their clients';
