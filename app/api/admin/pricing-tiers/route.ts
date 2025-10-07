import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function PUT(request: NextRequest) {
  try {
    console.log('🚀 Pricing tiers update API called')
    const { userId } = await auth()
    
    if (!userId) {
      console.log('❌ Unauthorized request')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { tiers } = await request.json()

    console.log('💾 Saving pricing tiers to database...', tiers)

    // For now, we'll store the pricing tiers in a simple key-value table
    // In a real implementation, you might have a dedicated pricing_tiers table
    const { error: upsertError } = await supabase
      .from('pricing_tiers')
      .upsert({
        id: 'current_tiers',
        tiers_data: tiers,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('❌ Error saving pricing tiers:', upsertError)
      return NextResponse.json(
        { success: false, error: 'Failed to save pricing tiers' },
        { status: 500 }
      )
    }

    console.log('✅ Pricing tiers saved successfully')
    return NextResponse.json({
      success: true,
      message: 'Pricing tiers updated successfully'
    })

  } catch (error) {
    console.error('❌ Error in pricing tiers update:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('📋 Fetching current pricing tiers...')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pricing_tiers')
      .select('tiers_data')
      .eq('id', 'current_tiers')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error fetching pricing tiers:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pricing tiers' },
        { status: 500 }
      )
    }

    console.log('✅ Pricing tiers fetched successfully')
    return NextResponse.json({
      success: true,
      data: data?.tiers_data || null
    })

  } catch (error) {
    console.error('❌ Error fetching pricing tiers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
