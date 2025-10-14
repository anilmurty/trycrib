import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Running migration 047: Add pending_seller_approval status...")
    
    // Use service role client to bypass RLS for migration operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Add new status constraint
    const { error: constraintError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.property_listing_requests 
        DROP CONSTRAINT IF EXISTS property_listing_requests_status_check;

        ALTER TABLE public.property_listing_requests 
        ADD CONSTRAINT property_listing_requests_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'pending_seller_approval'));
      `
    })
    
    if (constraintError) {
      console.error("❌ Error updating status constraint:", constraintError)
      return NextResponse.json({ 
        error: `Failed to update status constraint: ${constraintError.message}` 
      }, { status: 500 })
    }
    
    // Add new columns
    const { error: columnsError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.property_listing_requests 
        ADD COLUMN IF NOT EXISTS property_setup_data JSONB,
        ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS seller_approved_at TIMESTAMPTZ;
      `
    })
    
    if (columnsError) {
      console.error("❌ Error adding columns:", columnsError)
      return NextResponse.json({ 
        error: `Failed to add columns: ${columnsError.message}` 
      }, { status: 500 })
    }
    
    console.log("✅ Migration 047 completed successfully")
    return NextResponse.json({ 
      success: true, 
      message: "Migration 047 completed successfully" 
    })
    
  } catch (error) {
    console.error("❌ Error in migration 047 API:", error)
    return NextResponse.json({ 
      error: `Failed to run migration 047: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}