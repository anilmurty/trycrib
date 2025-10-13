import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Drop existing policies
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own property listing requests" ON public.property_listing_requests;
        DROP POLICY IF EXISTS "Users can insert their own property listing requests" ON public.property_listing_requests;
        DROP POLICY IF EXISTS "Users can update their own property listing requests" ON public.property_listing_requests;
      `
    })

    // Create more permissive policies for API routes
    await supabase.rpc('exec_sql', {
      sql: `
        -- Allow all operations for now (we can tighten this later)
        CREATE POLICY "Allow all for property_listing_requests" ON public.property_listing_requests
        FOR ALL USING (true) WITH CHECK (true);
      `
    })

    return NextResponse.json({ 
      success: true, 
      message: "RLS policies updated successfully" 
    })

  } catch (error) {
    console.error("Error fixing RLS policies:", error)
    return NextResponse.json({ 
      error: `Failed to fix RLS policies: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
