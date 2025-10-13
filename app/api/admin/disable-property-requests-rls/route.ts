import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Disable RLS temporarily for this table
    const { error } = await supabase
      .from('property_listing_requests')
      .select('id')
      .limit(1)

    if (error) {
      console.log("Table access error:", error)
    }

    // Try to insert a test record to see if RLS is the issue
    const { data, error: insertError } = await supabase
      .from('property_listing_requests')
      .insert([{
        seller_id: 'test-user',
        agent_email: 'test@example.com',
        request_type: 'existing_property',
        property_address: 'Test Address',
        property_city: 'Test City',
        property_state: 'WA',
        property_zip: '12345',
        message: 'Test message',
        status: 'pending'
      }])
      .select()

    if (insertError) {
      console.log("Insert error:", insertError)
      return NextResponse.json({ 
        error: `RLS still blocking: ${insertError.message}`,
        details: insertError
      }, { status: 500 })
    }

    // Clean up test record
    if (data && data[0]) {
      await supabase
        .from('property_listing_requests')
        .delete()
        .eq('id', data[0].id)
    }

    return NextResponse.json({ 
      success: true, 
      message: "RLS test passed - table is accessible" 
    })

  } catch (error) {
    console.error("Error testing RLS:", error)
    return NextResponse.json({ 
      error: `Failed to test RLS: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
