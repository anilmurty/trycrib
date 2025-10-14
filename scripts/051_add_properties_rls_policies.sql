-- Add RLS policies for properties table to allow sellers to view their own properties

-- Enable RLS on properties table if not already enabled
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties table
CREATE POLICY "Users can view their own properties" ON public.properties
  FOR SELECT USING (auth.uid()::TEXT = seller_id);

CREATE POLICY "Users can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid()::TEXT = seller_id);

CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid()::TEXT = seller_id);

CREATE POLICY "Users can delete their own properties" ON public.properties
  FOR DELETE USING (auth.uid()::TEXT = seller_id);

-- Allow public read access for property search (buyers need to see properties)
CREATE POLICY "Public can view active properties" ON public.properties
  FOR SELECT USING (is_active = true);
