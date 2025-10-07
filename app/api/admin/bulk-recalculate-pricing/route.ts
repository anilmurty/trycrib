import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { calculatePricingTier, calculatePricePerNight } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Fetch all properties that are not using custom pricing
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, listing_price, pricing_override')
      .eq('pricing_override', false)

    if (fetchError) {
      console.error('Error fetching properties:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No properties to recalculate',
        updated: 0
      })
    }

    let updatedCount = 0
    const errors: string[] = []

    // Process properties in batches
    const batchSize = 50
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize)
      
      for (const property of batch) {
        if (!property.listing_price || property.listing_price <= 0) {
          continue
        }

        const pricingTier = calculatePricingTier(property.listing_price)
        const calculatedPricePerNight = calculatePricePerNight(pricingTier)

        const { error: updateError } = await supabase
          .from('properties')
          .update({
            pricing_tier: pricingTier,
            calculated_price_per_night: calculatedPricePerNight,
            updated_at: new Date().toISOString()
          })
          .eq('id', property.id)

        if (updateError) {
          console.error(`Error updating property ${property.id}:`, updateError)
          errors.push(`Property ${property.id}: ${updateError.message}`)
        } else {
          updatedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recalculated pricing for ${updatedCount} properties`,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in bulk recalculate pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
