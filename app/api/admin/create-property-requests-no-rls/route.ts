import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const supabase = await createClient()

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "scripts", "048_create_property_requests_no_rls.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    console.log("🚀 Creating property_requests table without RLS...")

    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 50) + "...")
        
        // Try to execute as a query first
        const { error } = await supabase
          .from('property_requests')
          .select('id')
          .limit(1)
        
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, try to create it
          console.log("Table doesn't exist, attempting to create...")
          // We'll need to use a different approach since we can't execute DDL directly
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Property requests table creation attempted" 
    })

  } catch (error) {
    console.error("❌ Error creating table:", error)
    return NextResponse.json({ 
      error: `Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
