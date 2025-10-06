-- Add Pricing System to Properties Table
-- This script adds pricing tier fields and calculated pricing to the properties table

-- Add pricing system columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS pricing_tier TEXT,
ADD COLUMN IF NOT EXISTS calculated_price_per_night INTEGER,
ADD COLUMN IF NOT EXISTS pricing_override BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_price_per_night INTEGER;

-- Create pricing tier enum for validation
CREATE TYPE pricing_tier AS ENUM (
  'under_500k',
  '500k_1m', 
  '1m_1_5m',
  '1_5m_3m',
  '3m_5m',
  'over_5m'
);

-- Update the pricing_tier column to use the enum
ALTER TABLE public.properties 
ALTER COLUMN pricing_tier TYPE pricing_tier USING pricing_tier::pricing_tier;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_pricing_tier ON public.properties(pricing_tier);
CREATE INDEX IF NOT EXISTS idx_properties_calculated_price ON public.properties(calculated_price_per_night);
CREATE INDEX IF NOT EXISTS idx_properties_listing_price ON public.properties(listing_price);

-- Add check constraints for data validation
ALTER TABLE public.properties 
ADD CONSTRAINT check_calculated_price_positive 
CHECK (calculated_price_per_night IS NULL OR calculated_price_per_night > 0);

ALTER TABLE public.properties 
ADD CONSTRAINT check_custom_price_positive 
CHECK (custom_price_per_night IS NULL OR custom_price_per_night > 0);

-- Create function to calculate pricing tier based on listing price
CREATE OR REPLACE FUNCTION calculate_pricing_tier(listing_price INTEGER)
RETURNS pricing_tier AS $$
BEGIN
  IF listing_price IS NULL OR listing_price <= 0 THEN
    RETURN NULL;
  ELSIF listing_price < 500000 THEN
    RETURN 'under_500k';
  ELSIF listing_price < 1000000 THEN
    RETURN '500k_1m';
  ELSIF listing_price < 1500000 THEN
    RETURN '1m_1_5m';
  ELSIF listing_price < 3000000 THEN
    RETURN '1_5m_3m';
  ELSIF listing_price < 5000000 THEN
    RETURN '3m_5m';
  ELSE
    RETURN 'over_5m';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate price per night based on pricing tier
CREATE OR REPLACE FUNCTION calculate_price_per_night(tier pricing_tier)
RETURNS INTEGER AS $$
BEGIN
  CASE tier
    WHEN 'under_500k' THEN RETURN 500;
    WHEN '500k_1m' THEN RETURN 750;
    WHEN '1m_1_5m' THEN RETURN 1250;
    WHEN '1_5m_3m' THEN RETURN 1500;
    WHEN '3m_5m' THEN RETURN 2000;
    WHEN 'over_5m' THEN RETURN NULL; -- Contact seller for pricing
    ELSE RETURN NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Update existing properties with calculated pricing
UPDATE public.properties 
SET 
  pricing_tier = calculate_pricing_tier(listing_price),
  calculated_price_per_night = calculate_price_per_night(calculate_pricing_tier(listing_price)),
  pricing_override = false
WHERE listing_price IS NOT NULL AND listing_price > 0;

-- For properties without listing_price, set default values
UPDATE public.properties 
SET 
  pricing_tier = NULL,
  calculated_price_per_night = NULL,
  pricing_override = false
WHERE listing_price IS NULL OR listing_price <= 0;

-- Add comments for documentation
COMMENT ON COLUMN public.properties.pricing_tier IS 'Pricing tier based on listing price: under_500k, 500k_1m, 1m_1_5m, 1_5m_3m, 3m_5m, over_5m';
COMMENT ON COLUMN public.properties.calculated_price_per_night IS 'Automatically calculated price per night based on pricing tier';
COMMENT ON COLUMN public.properties.pricing_override IS 'Whether to use custom pricing instead of calculated pricing';
COMMENT ON COLUMN public.properties.custom_price_per_night IS 'Custom price per night when pricing_override is true';
