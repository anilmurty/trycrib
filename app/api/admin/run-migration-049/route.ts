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
    const sqlPath = path.join(process.cwd(), 'scripts', '049_fix_status_constraint.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('Migration failed:', error)
      return NextResponse.json({ 
        error: `Migration failed: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration 049 executed successfully',
      data 
    })

  } catch (error) {
    console.error('Error running migration 049:', error)
    return NextResponse.json({ 
      error: `Failed to run migration: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
