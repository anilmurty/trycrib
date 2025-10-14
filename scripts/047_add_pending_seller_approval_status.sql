-- Add new status 'pending_seller_approval' to property_listing_requests
ALTER TABLE public.property_listing_requests 
DROP CONSTRAINT IF EXISTS property_listing_requests_status_check;

ALTER TABLE public.property_listing_requests 
ADD CONSTRAINT property_listing_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'pending_seller_approval'));

-- Add columns for property setup details
ALTER TABLE public.property_listing_requests 
ADD COLUMN IF NOT EXISTS property_setup_data JSONB,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seller_approved_at TIMESTAMPTZ;
