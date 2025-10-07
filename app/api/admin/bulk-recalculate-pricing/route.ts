import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { calculatePricingTier, calculatePricePerNight } from '@/lib/pricing'

// Dynamic pricing functions that use database values
function calculatePricingTierDynamic(listingPrice: number, tiers: any[]): string | null {
  if (listingPrice === null || listingPrice === undefined) {
    return null
  }
  for (const tier of tiers) {
    if (listingPrice >= tier.minPrice && (tier.maxPrice === null || listingPrice <= tier.maxPrice)) {
      return tier.tier
    }
  }
  return null
}

function calculatePricePerNightDynamic(tier: string | null, tiers: any[]): number | null {
  if (!tier) {
    return null
  }
  const foundTier = tiers.find(t => t.tier === tier)
  return foundTier ? foundTier.pricePerNight : null
}

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

    // Parse request body to get specific tiers to recalculate
    let body = {}
    try {
      body = await request.json()
    } catch (error) {
      console.log('📝 No request body provided, will recalculate all tiers')
    }

    const { affectedTiers } = body as { affectedTiers?: string[] }
    console.log('📨 Request body:', body)
    console.log('🎯 Affected tiers from request:', affectedTiers)

    console.log('✅ User authenticated, initializing Supabase client...')
    const supabase = await createClient()

    console.log('📋 Fetching current pricing tiers from database...')
    const { data: tiersData, error: tiersError } = await supabase
      .from('pricing_tiers')
      .select('tiers_data')
      .eq('id', 'current_tiers')
      .single()

    if (tiersError) {
      console.log('⚠️ No custom pricing tiers found, using defaults')
    }

    const tiers = tiersData?.tiers_data || [
      { tier: 'under_500k', minPrice: 0, maxPrice: 499999, pricePerNight: 500 },
      { tier: '500k_1m', minPrice: 500000, maxPrice: 999999, pricePerNight: 750 },
      { tier: '1m_1_5m', minPrice: 1000000, maxPrice: 1499999, pricePerNight: 1250 },
      { tier: '1_5m_3m', minPrice: 1500000, maxPrice: 2999999, pricePerNight: 1500 },
      { tier: '3m_5m', minPrice: 3000000, maxPrice: 4999999, pricePerNight: 2000 },
      { tier: 'over_5m', minPrice: 5000000, maxPrice: null, pricePerNight: null }
    ]

    console.log('📊 Using pricing tiers:', tiers.map(t => `${t.tier}: $${t.pricePerNight}/night`).join(', '))

    // If specific tiers are provided, only recalculate those ranges
    let priceRangeFilter = {}
    if (affectedTiers && affectedTiers.length > 0) {
      console.log(`🎯 Recalculating only affected tiers: ${affectedTiers.join(', ')}`)
      
      // Find the price ranges for the affected tiers
      const affectedTierRanges = tiers.filter(tier => affectedTiers.includes(tier.tier))
      console.log('🔍 Affected tier ranges:', affectedTierRanges.map(t => `${t.tier}: $${t.minPrice}-${t.maxPrice || '∞'}`))
      
      const minPrice = Math.min(...affectedTierRanges.map(t => t.minPrice))
      const maxPrice = Math.max(...affectedTierRanges.map(t => t.maxPrice || Infinity))
      
      console.log(`📊 Price range filter: $${minPrice} - $${maxPrice === Infinity ? '∞' : maxPrice}`)
      
      priceRangeFilter = {
        gte: minPrice,
        lte: maxPrice === Infinity ? null : maxPrice
      }
    } else {
      console.log('🔄 Recalculating all properties (no specific tiers provided)')
    }

    console.log('📋 Fetching properties that need pricing recalculation...')
    // Build query based on whether we're filtering by price range
    let query = supabase
      .from('properties')
      .select('id, listing_price, pricing_override')
      .eq('pricing_override', false)
      .not('listing_price', 'is', null)
      .gt('listing_price', 0)

    if (priceRangeFilter.gte !== undefined) {
      console.log(`🔍 Adding filter: listing_price >= ${priceRangeFilter.gte}`)
      query = query.gte('listing_price', priceRangeFilter.gte)
    }
    if (priceRangeFilter.lte !== null && priceRangeFilter.lte !== undefined) {
      console.log(`🔍 Adding filter: listing_price <= ${priceRangeFilter.lte}`)
      query = query.lte('listing_price', priceRangeFilter.lte)
    }

    const { data: properties, error: fetchError } = await query

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

        const pricingTier = calculatePricingTierDynamic(property.listing_price, tiers)
        const calculatedPricePerNight = calculatePricePerNightDynamic(pricingTier, tiers)

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
