-- Create buyer listing requests table
-- This table stores requests from buyers for properties they want to see listed
CREATE TABLE IF NOT EXISTS public.buyer_listing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'listed', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buyer_listing_requests_buyer_id ON public.buyer_listing_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_listing_requests_status ON public.buyer_listing_requests(status);
CREATE INDEX IF NOT EXISTS idx_buyer_listing_requests_created_at ON public.buyer_listing_requests(created_at);

-- Enable RLS
ALTER TABLE public.buyer_listing_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own buyer listing requests" ON public.buyer_listing_requests
  FOR SELECT USING (auth.uid()::TEXT = buyer_id);

CREATE POLICY "Users can insert their own buyer listing requests" ON public.buyer_listing_requests
  FOR INSERT WITH CHECK (auth.uid()::TEXT = buyer_id);

CREATE POLICY "Users can update their own buyer listing requests" ON public.buyer_listing_requests
  FOR UPDATE USING (auth.uid()::TEXT = buyer_id);

-- Allow admins to view all requests
CREATE POLICY "Admins can view all buyer listing requests" ON public.buyer_listing_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::TEXT
      AND profiles.role IN ('admin', 'superadmin')
    )
  );
