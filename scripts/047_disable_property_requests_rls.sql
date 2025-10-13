-- Temporarily disable RLS on property_listing_requests table
ALTER TABLE public.property_listing_requests DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own property listing requests" ON public.property_listing_requests;
DROP POLICY IF EXISTS "Users can insert their own property listing requests" ON public.property_listing_requests;
DROP POLICY IF EXISTS "Users can update their own property listing requests" ON public.property_listing_requests;
DROP POLICY IF EXISTS "Allow all for property_listing_requests" ON public.property_listing_requests;

-- Create a simple policy that allows all operations
CREATE POLICY "Allow all operations on property_listing_requests" ON public.property_listing_requests
FOR ALL USING (true) WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.property_listing_requests ENABLE ROW LEVEL SECURITY;
