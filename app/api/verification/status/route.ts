import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data since we haven't created the tables yet
    // In production, this would query the verification tables
    
    const mockVerificationData = {
      verificationStatus: null, // 'pending' | 'approved' | 'rejected' | 'expired' | null
      lastAttempt: null,
      rejectionReason: null,
      verificationNotes: null,
      documentUrl: null,
      preapprovalAmount: null,
      propertyAddress: null
    }

    return NextResponse.json(mockVerificationData)
    
  } catch (error) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch verification status' 
    }, { status: 500 })
  }
}
