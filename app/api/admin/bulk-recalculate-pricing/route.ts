import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { calculatePricingTier, calculatePricePerNight } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Bulk recalculate pricing API called')
    const { userId } = await auth()
    
    if (!userId) {
      console.log('❌ Unauthorized request')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated, initializing Supabase client...')
    const supabase = await createClient()

    console.log('📋 Fetching properties that need pricing recalculation...')
    // Fetch all properties that are not using custom pricing
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, listing_price, pricing_override')
      .eq('pricing_override', false)

    if (fetchError) {
      console.error('❌ Error fetching properties:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    if (!properties || properties.length === 0) {
      console.log('ℹ️ No properties to recalculate')
      return NextResponse.json({
        success: true,
        message: 'No properties to recalculate',
        updated: 0
      })
    }

    console.log(`📊 Found ${properties.length} properties to recalculate`)

    let updatedCount = 0
    const errors: string[] = []

    // Process properties in batches
    const batchSize = 50
    const totalBatches = Math.ceil(properties.length / batchSize)
    console.log(`🔄 Processing ${totalBatches} batches of ${batchSize} properties each...`)

    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} properties)...`)
      
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
          console.error(`❌ Error updating property ${property.id}:`, updateError)
          errors.push(`Property ${property.id}: ${updateError.message}`)
        } else {
          updatedCount++
        }
      }
    }

    console.log(`✅ Bulk recalculate completed: ${updatedCount} properties updated, ${errors.length} errors`)
    return NextResponse.json({
      success: true,
      message: `Successfully recalculated pricing for ${updatedCount} properties`,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Error in bulk recalculate pricing:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
