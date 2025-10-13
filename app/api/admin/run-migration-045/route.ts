import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    console.log("🚀 Running migration 045: Add agent info to profiles...")
    
    // Use service role client to bypass RLS for migration operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Add agent columns to buyer_profiles
    const { error: buyerError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.buyer_profiles 
        ADD COLUMN IF NOT EXISTS agent_name TEXT,
        ADD COLUMN IF NOT EXISTS agent_email TEXT,
        ADD COLUMN IF NOT EXISTS agent_phone TEXT;
      `
    })
    
    if (buyerError) {
      console.error("❌ Error adding columns to buyer_profiles:", buyerError)
      return NextResponse.json({ error: "Failed to add columns to buyer_profiles" }, { status: 500 })
    }
    
    // Add agent columns to seller_profiles
    const { error: sellerError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.seller_profiles 
        ADD COLUMN IF NOT EXISTS agent_name TEXT,
        ADD COLUMN IF NOT EXISTS agent_email TEXT,
        ADD COLUMN IF NOT EXISTS agent_phone TEXT;
      `
    })
    
    if (sellerError) {
      console.error("❌ Error adding columns to seller_profiles:", sellerError)
      return NextResponse.json({ error: "Failed to add columns to seller_profiles" }, { status: 500 })
    }
    
    console.log("✅ Migration completed successfully!")
    
    return NextResponse.json({ 
      success: true, 
      message: "Added agent_name, agent_email, and agent_phone columns to buyer_profiles and seller_profiles tables" 
    })
    
  } catch (error) {
    console.error("❌ Error running migration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
