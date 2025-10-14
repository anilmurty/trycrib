-- Update property listing request status values to be more descriptive
ALTER TABLE public.property_listing_requests 
DROP CONSTRAINT IF EXISTS property_listing_requests_status_check;

ALTER TABLE public.property_listing_requests 
ADD CONSTRAINT property_listing_requests_status_check 
CHECK (status IN ('listing_requested', 'listing_pending', 'approval_pending', 'rejected', 'listed'));

-- Update existing records to use new status names
UPDATE public.property_listing_requests 
SET status = 'listing_requested' 
WHERE status = 'pending';

UPDATE public.property_listing_requests 
SET status = 'listing_pending' 
WHERE status = 'approved';

UPDATE public.property_listing_requests 
SET status = 'approval_pending' 
WHERE status = 'pending_seller_approval';

UPDATE public.property_listing_requests 
SET status = 'listed' 
WHERE status = 'completed';
