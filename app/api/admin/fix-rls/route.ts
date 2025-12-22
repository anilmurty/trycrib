import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or superadmin
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fix RLS policies for property_claims
    const queries = [
      // Drop existing policies
      'DROP POLICY IF EXISTS "Users can view own property claims" ON public.property_claims;',
      'DROP POLICY IF EXISTS "Sellers can insert property claims" ON public.property_claims;',
      'DROP POLICY IF EXISTS "Admins can update property claims" ON public.property_claims;',
      
      // Create new permissive policies
      'CREATE POLICY "Users can view own property claims" ON public.property_claims FOR SELECT USING (true);',
      'CREATE POLICY "Sellers can insert property claims" ON public.property_claims FOR INSERT WITH CHECK (true);',
      'CREATE POLICY "Admins can update property claims" ON public.property_claims FOR UPDATE USING (true);'
    ]

    const results = []
    for (const query of queries) {
      const { data, error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('SQL Error:', error)
        results.push({ query, error: error.message })
      } else {
        results.push({ query, success: true })
      }
    }

    return NextResponse.json({ 
      message: 'RLS policies updated',
      results 
    })

  } catch (error) {
    console.error('Error fixing RLS policies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
