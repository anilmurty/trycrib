-- Create a new table without RLS for property listing requests
CREATE TABLE IF NOT EXISTS public.property_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id TEXT NOT NULL,
  agent_email TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('existing_property', 'new_property')),
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_requests_seller_id ON public.property_requests(seller_id);
CREATE INDEX IF NOT EXISTS idx_property_requests_agent_email ON public.property_requests(agent_email);
CREATE INDEX IF NOT EXISTS idx_property_requests_status ON public.property_requests(status);
CREATE INDEX IF NOT EXISTS idx_property_requests_created_at ON public.property_requests(created_at);

-- Do NOT enable RLS on this table - we want API routes to be able to insert without authentication issues
