-- Create pricing_tiers table to store dynamic pricing configuration
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    id TEXT PRIMARY KEY DEFAULT 'current_tiers',
    tiers_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.pricing_tiers IS 'Stores dynamic pricing tier configuration';
COMMENT ON COLUMN public.pricing_tiers.tiers_data IS 'JSON data containing all pricing tier definitions';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_id ON public.pricing_tiers (id);

-- Insert default pricing tiers
INSERT INTO public.pricing_tiers (id, tiers_data) VALUES (
    'current_tiers',
    '[
        {
            "tier": "under_500k",
            "name": "Under $500K",
            "description": "Properties under $500,000",
            "pricePerNight": 500,
            "color": "green",
            "minPrice": 0,
            "maxPrice": 499999
        },
        {
            "tier": "500k_1m",
            "name": "$500K - $1M",
            "description": "Properties between $500,000 and $1,000,000",
            "pricePerNight": 750,
            "color": "blue",
            "minPrice": 500000,
            "maxPrice": 999999
        },
        {
            "tier": "1m_1_5m",
            "name": "$1M - $1.5M",
            "description": "Properties between $1,000,000 and $1,500,000",
            "pricePerNight": 1250,
            "color": "purple",
            "minPrice": 1000000,
            "maxPrice": 1499999
        },
        {
            "tier": "1_5m_3m",
            "name": "$1.5M - $3M",
            "description": "Properties between $1,500,000 and $3,000,000",
            "pricePerNight": 1500,
            "color": "orange",
            "minPrice": 1500000,
            "maxPrice": 2999999
        },
        {
            "tier": "3m_5m",
            "name": "$3M - $5M",
            "description": "Properties between $3,000,000 and $5,000,000",
            "pricePerNight": 2000,
            "color": "red",
            "minPrice": 3000000,
            "maxPrice": 4999999
        },
        {
            "tier": "over_5m",
            "name": "Over $5M",
            "description": "Properties over $5,000,000 - Contact Seller",
            "pricePerNight": null,
            "color": "gray",
            "minPrice": 5000000,
            "maxPrice": null
        }
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;
