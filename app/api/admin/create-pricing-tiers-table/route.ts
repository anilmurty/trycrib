import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating pricing tiers table...')
    const { userId } = await auth()
    
    if (!userId) {
      console.log('❌ Unauthorized request')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Create the pricing_tiers table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.pricing_tiers (
            id TEXT PRIMARY KEY DEFAULT 'current_tiers',
            tiers_data JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (createError) {
      console.error('❌ Error creating table:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create pricing_tiers table' },
        { status: 500 }
      )
    }

    // Insert default pricing tiers
    const defaultTiers = [
      {
        tier: "under_500k",
        name: "Under $500K",
        description: "Properties under $500,000",
        pricePerNight: 500,
        color: "green",
        minPrice: 0,
        maxPrice: 499999
      },
      {
        tier: "500k_1m",
        name: "$500K - $1M",
        description: "Properties between $500,000 and $1,000,000",
        pricePerNight: 750,
        color: "blue",
        minPrice: 500000,
        maxPrice: 999999
      },
      {
        tier: "1m_1_5m",
        name: "$1M - $1.5M",
        description: "Properties between $1,000,000 and $1,500,000",
        pricePerNight: 1250,
        color: "purple",
        minPrice: 1000000,
        maxPrice: 1499999
      },
      {
        tier: "1_5m_3m",
        name: "$1.5M - $3M",
        description: "Properties between $1,500,000 and $3,000,000",
        pricePerNight: 1500,
        color: "orange",
        minPrice: 1500000,
        maxPrice: 2999999
      },
      {
        tier: "3m_5m",
        name: "$3M - $5M",
        description: "Properties between $3,000,000 and $5,000,000",
        pricePerNight: 2000,
        color: "red",
        minPrice: 3000000,
        maxPrice: 4999999
      },
      {
        tier: "over_5m",
        name: "Over $5M",
        description: "Properties over $5,000,000 - Contact Seller",
        pricePerNight: null,
        color: "gray",
        minPrice: 5000000,
        maxPrice: null
      }
    ]

    const { error: insertError } = await supabase
      .from('pricing_tiers')
      .upsert({
        id: 'current_tiers',
        tiers_data: defaultTiers,
        updated_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ Error inserting default tiers:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to insert default pricing tiers' },
        { status: 500 }
      )
    }

    console.log('✅ Pricing tiers table created and populated successfully')
    return NextResponse.json({
      success: true,
      message: 'Pricing tiers table created and populated successfully'
    })

  } catch (error) {
    console.error('❌ Error creating pricing tiers table:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
