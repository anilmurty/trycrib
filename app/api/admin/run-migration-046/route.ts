import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Running migration 046: Create property listing requests...")
    
    const supabase = createClient()
    
    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(process.cwd(), 'scripts/046_create_property_listing_requests.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error } = await supabase.rpc('exec', { sql: statement })
        
        if (error) {
          console.error(`Error executing statement: ${statement}`, error)
          return NextResponse.json({ 
            error: `Failed to execute statement: ${error.message}` 
          }, { status: 500 })
        }
      }
    }
    
    console.log("✅ Migration 046 completed successfully")
    return NextResponse.json({ 
      success: true, 
      message: "Migration 046 completed successfully" 
    })
    
  } catch (error) {
    console.error("❌ Error running migration 046:", error)
    return NextResponse.json({ 
      error: `Failed to run migration: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
