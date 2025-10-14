-- Add property_setup_data column to property_listing_requests table
ALTER TABLE public.property_listing_requests 
ADD COLUMN IF NOT EXISTS property_setup_data JSONB;

-- Add setup_completed_at column to track when setup was completed
ALTER TABLE public.property_listing_requests 
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ;

-- Add index for property_setup_data for better query performance
CREATE INDEX IF NOT EXISTS idx_property_listing_requests_setup_data ON public.property_listing_requests USING GIN (property_setup_data);
