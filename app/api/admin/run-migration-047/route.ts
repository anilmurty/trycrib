import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const supabase = await createClient()

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "scripts", "047_disable_property_requests_rls.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    console.log("🚀 Running migration 047: Disable property_listing_requests RLS...")

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error("❌ Migration failed:", error)
      return NextResponse.json({ 
        error: `Migration failed: ${error.message}` 
      }, { status: 500 })
    }

    console.log("✅ Migration 047 completed successfully")
    return NextResponse.json({ 
      success: true, 
      message: "Migration 047 completed successfully" 
    })

  } catch (error) {
    console.error("❌ Error running migration 047:", error)
    return NextResponse.json({ 
      error: `Failed to run migration: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
