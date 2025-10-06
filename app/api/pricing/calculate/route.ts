import { NextRequest, NextResponse } from 'next/server'
import { calculatePricingTier, calculatePricePerNight, validatePricingData } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingPrice } = body

    if (!listingPrice || typeof listingPrice !== 'number' || listingPrice <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Valid listing price is required' 
        },
        { status: 400 }
      )
    }

    const tier = calculatePricingTier(listingPrice)
    const pricePerNight = calculatePricePerNight(tier)

    const result = {
      listingPrice,
      tier,
      pricePerNight,
      isContactSeller: tier === 'over_5m' || pricePerNight === null
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error calculating pricing:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate pricing' 
      },
      { status: 500 }
    )
  }
}
