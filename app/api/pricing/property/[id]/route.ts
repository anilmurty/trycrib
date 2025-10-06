import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import { calculatePricingTier, calculatePricePerNight, validatePricingData } from '@/lib/pricing'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      pricingOverride, 
      customPricePerNight, 
      listingPrice 
    } = body

    // Validate input
    const validation = validatePricingData({
      listingPrice,
      pricingOverride,
      customPricePerNight
    })

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid pricing data',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    let updateData: any = {
      pricing_override: pricingOverride || false
    }

    if (pricingOverride) {
      // Use custom pricing
      updateData.custom_price_per_night = customPricePerNight
      updateData.calculated_price_per_night = null
      updateData.pricing_tier = null
    } else {
      // Calculate pricing based on listing price
      const tier = calculatePricingTier(listingPrice)
      const pricePerNight = calculatePricePerNight(tier)
      
      updateData.pricing_tier = tier
      updateData.calculated_price_per_night = pricePerNight
      updateData.custom_price_per_night = null
    }

    // Update the property
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating property pricing:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update property pricing' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        pricing_tier: data.pricing_tier,
        calculated_price_per_night: data.calculated_price_per_night,
        pricing_override: data.pricing_override,
        custom_price_per_night: data.custom_price_per_night
      }
    })
  } catch (error) {
    console.error('Error updating property pricing:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update property pricing' 
      },
      { status: 500 }
    )
  }
}
