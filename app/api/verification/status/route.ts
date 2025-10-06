import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
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

    // Check if user has uploaded any documents by looking in storage
    const { data: userFiles } = await supabase.storage
      .from('verification-documents')
      .list('', {
        search: userId
      })

    // If user has uploaded files, return pending status
    // Otherwise return null (not verified)
    const hasUploadedDocuments = userFiles && userFiles.length > 0
    
    const mockVerificationData = {
      verificationStatus: hasUploadedDocuments ? 'pending' : null,
      lastAttempt: hasUploadedDocuments ? new Date().toISOString() : null,
      rejectionReason: null,
      verificationNotes: null,
      documentUrl: hasUploadedDocuments && userFiles[0] ? 
        supabase.storage.from('verification-documents').getPublicUrl(userFiles[0].name).data.publicUrl : null,
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
