import { NextResponse } from 'next/server'
import { getAllPricingTiers } from '@/lib/pricing'

export async function GET() {
  try {
    const tiers = getAllPricingTiers()
    
    return NextResponse.json({
      success: true,
      data: tiers
    })
  } catch (error) {
    console.error('Error fetching pricing tiers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pricing tiers' 
      },
      { status: 500 }
    )
  }
}
