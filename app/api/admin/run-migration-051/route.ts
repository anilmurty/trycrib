import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(process.cwd(), 'scripts', '051_add_properties_rls_policies.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() })
        if (error) {
          console.error("Error executing statement:", statement, error)
          return NextResponse.json({ error: `Migration failed: ${error.message}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true, message: "Migration 051 executed successfully" })
  } catch (error) {
    console.error("Error running migration 051:", error)
    return NextResponse.json({ error: `Error running migration 051: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}
