import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function POST(request: NextRequest) {
  try {
    console.log('Creating verification tables...')
    
    // Create verification_documents table
    const { error: docsError } = await supabase
      .from('verification_documents')
      .select('*')
      .limit(1)
    
    if (docsError && docsError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Creating verification_documents table...')
      // We'll need to use raw SQL here
      const { error: createDocsError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE verification_documents (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_role TEXT NOT NULL CHECK (user_role IN ('buyer', 'seller')),
            document_type TEXT NOT NULL CHECK (document_type IN ('property_tax_statement', 'property_info_screenshot', 'loan_preapproval')),
            file_url TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
            rejection_reason TEXT,
            verified_by TEXT,
            verified_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
      
      if (createDocsError) {
        console.error('Error creating verification_documents:', createDocsError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create verification_documents table',
          details: createDocsError
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification tables check completed'
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
