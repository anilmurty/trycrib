import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const supabase = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(process.cwd(), 'scripts', '067_ensure_client_invitations_role_column.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Split the SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' })
        if (error) {
          console.error("Error executing statement:", statement.substring(0, 100), error)
          // Some errors are expected (like column already exists), so we continue
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            return NextResponse.json({ error: `Migration failed: ${error.message}` }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration 067 executed successfully. The role column should now exist in client_invitations table.' 
    })
  } catch (error) {
    console.error('Error running migration 067:', error)
    return NextResponse.json({ 
      error: `Failed to run migration: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
