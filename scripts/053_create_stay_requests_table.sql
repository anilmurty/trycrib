-- Create stay requests table
CREATE TABLE IF NOT EXISTS public.stay_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  check_in DATE,
  check_out DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stay_requests_property_id ON public.stay_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_stay_requests_buyer_id ON public.stay_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_stay_requests_status ON public.stay_requests(status);
CREATE INDEX IF NOT EXISTS idx_stay_requests_created_at ON public.stay_requests(created_at);

-- Enable RLS
ALTER TABLE public.stay_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own stay requests" ON public.stay_requests
  FOR SELECT USING (auth.uid()::TEXT = buyer_id);

CREATE POLICY "Users can insert their own stay requests" ON public.stay_requests
  FOR INSERT WITH CHECK (auth.uid()::TEXT = buyer_id);

CREATE POLICY "Users can update their own stay requests" ON public.stay_requests
  FOR UPDATE USING (auth.uid()::TEXT = buyer_id);
