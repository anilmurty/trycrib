// Pricing System Utilities
// Handles tiered pricing calculations and display formatting

export type PricingTier = 
  | 'under_500k'
  | '500k_1m' 
  | '1m_1_5m'
  | '1_5m_3m'
  | '3m_5m'
  | 'over_5m'

export interface PricingTierInfo {
  tier: PricingTier
  name: string
  description: string
  pricePerNight: number | null
  color: string
  minPrice: number
  maxPrice: number | null
}

// Pricing tier definitions
export const PRICING_TIERS: Record<PricingTier, PricingTierInfo> = {
  under_500k: {
    tier: 'under_500k',
    name: 'Under $500K',
    description: 'Properties under $500,000',
    pricePerNight: 500,
    color: 'green',
    minPrice: 0,
    maxPrice: 499999
  },
  '500k_1m': {
    tier: '500k_1m',
    name: '$500K - $1M',
    description: 'Properties between $500,000 and $1,000,000',
    pricePerNight: 750,
    color: 'blue',
    minPrice: 500000,
    maxPrice: 999999
  },
  '1m_1_5m': {
    tier: '1m_1_5m',
    name: '$1M - $1.5M',
    description: 'Properties between $1,000,000 and $1,500,000',
    pricePerNight: 1250,
    color: 'purple',
    minPrice: 1000000,
    maxPrice: 1499999
  },
  '1_5m_3m': {
    tier: '1_5m_3m',
    name: '$1.5M - $3M',
    description: 'Properties between $1,500,000 and $3,000,000',
    pricePerNight: 1500,
    color: 'orange',
    minPrice: 1500000,
    maxPrice: 2999999
  },
  '3m_5m': {
    tier: '3m_5m',
    name: '$3M - $5M',
    description: 'Properties between $3,000,000 and $5,000,000',
    pricePerNight: 2000,
    color: 'red',
    minPrice: 3000000,
    maxPrice: 4999999
  },
  over_5m: {
    tier: 'over_5m',
    name: 'Over $5M',
    description: 'Properties over $5,000,000 - Contact Seller',
    pricePerNight: null,
    color: 'gray',
    minPrice: 5000000,
    maxPrice: null
  }
}

/**
 * Calculate pricing tier based on listing price
 */
export function calculatePricingTier(listingPrice: number | null): PricingTier | null {
  if (!listingPrice || listingPrice <= 0) {
    return null
  }

  if (listingPrice < 500000) {
    return 'under_500k'
  } else if (listingPrice < 1000000) {
    return '500k_1m'
  } else if (listingPrice < 1500000) {
    return '1m_1_5m'
  } else if (listingPrice < 3000000) {
    return '1_5m_3m'
  } else if (listingPrice < 5000000) {
    return '3m_5m'
  } else {
    return 'over_5m'
  }
}

/**
 * Calculate price per night based on pricing tier
 */
export function calculatePricePerNight(tier: PricingTier | null): number | null {
  if (!tier) return null
  return PRICING_TIERS[tier].pricePerNight
}

/**
 * Get pricing tier information
 */
export function getPricingTierInfo(tier: PricingTier | null): PricingTierInfo | null {
  if (!tier) return null
  return PRICING_TIERS[tier]
}

/**
 * Format price display with proper formatting
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'Contact Seller'
  return `$${price.toLocaleString()}`
}

/**
 * Format pricing display for property cards
 */
export function formatPricingDisplay(
  listingPrice: number | null,
  pricePerNight: number | null,
  tier: PricingTier | null
): {
  listingPriceDisplay: string
  nightlyRateDisplay: string
  tierDisplay: string
  isContactSeller: boolean
} {
  const listingPriceDisplay = listingPrice ? `$${listingPrice.toLocaleString()}` : 'Price TBD'
  const nightlyRateDisplay = pricePerNight ? `$${pricePerNight.toLocaleString()}/night` : 'Contact Seller'
  const tierInfo = getPricingTierInfo(tier)
  const tierDisplay = tierInfo ? tierInfo.name : 'Unknown'
  const isContactSeller = tier === 'over_5m' || pricePerNight === null

  return {
    listingPriceDisplay,
    nightlyRateDisplay,
    tierDisplay,
    isContactSeller
  }
}

/**
 * Get all pricing tiers for admin interface
 */
export function getAllPricingTiers(): PricingTierInfo[] {
  return Object.values(PRICING_TIERS)
}

/**
 * Validate pricing data
 */
export function validatePricingData(data: {
  listingPrice?: number | null
  pricePerNight?: number | null
  tier?: PricingTier | null
  pricingOverride?: boolean
  customPricePerNight?: number | null
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate listing price
  if (data.listingPrice !== null && data.listingPrice !== undefined && data.listingPrice <= 0) {
    errors.push('Listing price must be greater than 0')
  }

  // Validate price per night
  if (data.pricePerNight !== null && data.pricePerNight !== undefined && data.pricePerNight <= 0) {
    errors.push('Price per night must be greater than 0')
  }

  // Validate custom price per night
  if (data.customPricePerNight !== null && data.customPricePerNight !== undefined && data.customPricePerNight <= 0) {
    errors.push('Custom price per night must be greater than 0')
  }

  // Validate pricing override logic
  if (data.pricingOverride) {
    if (!data.customPricePerNight || data.customPricePerNight <= 0) {
      errors.push('Custom price per night is required when pricing override is enabled')
    }
  } else {
    if (!data.tier || !data.pricePerNight) {
      errors.push('Pricing tier and calculated price are required when override is disabled')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Calculate total booking cost
 */
export function calculateBookingTotal(
  pricePerNight: number | null,
  checkIn: string,
  checkOut: string
): number | null {
  if (!pricePerNight || !checkIn || !checkOut) return null

  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (nights <= 0) return null

  return nights * pricePerNight
}
