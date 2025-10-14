-- Add lot_size column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS lot_size DECIMAL(10,2);

-- Add comment to the column
COMMENT ON COLUMN public.properties.lot_size IS 'Lot size in square feet';
