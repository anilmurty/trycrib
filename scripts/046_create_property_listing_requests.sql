-- Create property listing requests table
CREATE TABLE IF NOT EXISTS public.property_listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  agent_email TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('existing_property', 'new_property')),
  property_address TEXT NOT NULL,
  property_city TEXT NOT NULL,
  property_state TEXT NOT NULL,
  property_zip TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  agent_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_listing_requests_seller_id ON public.property_listing_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_property_listing_requests_agent_email ON public.property_listing_requests(agent_email);
CREATE INDEX IF NOT EXISTS idx_property_listing_requests_status ON public.property_listing_requests(status);
CREATE INDEX IF NOT EXISTS idx_property_listing_requests_created_at ON public.property_listing_requests(created_at);

-- Enable RLS
ALTER TABLE public.property_listing_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own property listing requests" ON public.property_listing_requests
  FOR SELECT USING (auth.uid()::TEXT = seller_id);

CREATE POLICY "Users can insert their own property listing requests" ON public.property_listing_requests
  FOR INSERT WITH CHECK (auth.uid()::TEXT = seller_id);

CREATE POLICY "Users can update their own property listing requests" ON public.property_listing_requests
  FOR UPDATE USING (auth.uid()::TEXT = seller_id);

-- Add agent_created and created_by_agent columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS agent_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_by_agent BOOLEAN DEFAULT FALSE;
