import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id

    if (!propertyId) {
      return NextResponse.json({ 
        error: "Property ID is required" 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: property, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    if (!property) {
      return NextResponse.json({ 
        error: "Property not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      property 
    })

  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ 
      error: `Failed to fetch property: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
