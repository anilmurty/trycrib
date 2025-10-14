import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Running migration 048: Update status names...")
    
    // Use service role client to bypass RLS for migration operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Update status constraint
    const { error: constraintError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.property_listing_requests 
        DROP CONSTRAINT IF EXISTS property_listing_requests_status_check;

        ALTER TABLE public.property_listing_requests 
        ADD CONSTRAINT property_listing_requests_status_check 
        CHECK (status IN ('listing_requested', 'listing_pending', 'approval_pending', 'rejected', 'listed'));
      `
    })
    
    if (constraintError) {
      console.error("❌ Error updating status constraint:", constraintError)
      return NextResponse.json({ 
        error: `Failed to update status constraint: ${constraintError.message}` 
      }, { status: 500 })
    }
    
    // Update existing records
    const { error: updateError } = await supabase.rpc('exec', {
      sql: `
        UPDATE public.property_listing_requests 
        SET status = 'listing_requested' 
        WHERE status = 'pending';

        UPDATE public.property_listing_requests 
        SET status = 'listing_pending' 
        WHERE status = 'approved';

        UPDATE public.property_listing_requests 
        SET status = 'approval_pending' 
        WHERE status = 'pending_seller_approval';

        UPDATE public.property_listing_requests 
        SET status = 'listed' 
        WHERE status = 'completed';
      `
    })
    
    if (updateError) {
      console.error("❌ Error updating existing records:", updateError)
      return NextResponse.json({ 
        error: `Failed to update existing records: ${updateError.message}` 
      }, { status: 500 })
    }
    
    console.log("✅ Migration 048 completed successfully")
    return NextResponse.json({ 
      success: true, 
      message: "Migration 048 completed successfully" 
    })
    
  } catch (error) {
    console.error("❌ Error in migration 048 API:", error)
    return NextResponse.json({ 
      error: `Failed to run migration 048: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
