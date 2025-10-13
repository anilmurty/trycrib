import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seller_id, agent_email, property_id, request_type, property_address, property_city, property_state, property_zip, message } = body

    const supabase = createClient()

    console.log("Property listing request received:", {
      seller_id,
      agent_email,
      property_id,
      request_type,
      property_address,
      property_city,
      property_state,
      property_zip,
      message
    })

    // Insert into property_listing_requests table
    const { data, error } = await supabase
      .from("property_listing_requests")
      .insert([{
        seller_id,
        agent_email,
        property_id,
        request_type,
        property_address,
        property_city,
        property_state,
        property_zip,
        message,
        status: "pending"
      }])
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    console.log("Request saved successfully:", data)
    return NextResponse.json({ 
      success: true, 
      message: "Request received successfully",
      data: data[0]
    })

  } catch (error) {
    console.error("Error handling property listing request:", error)
    return NextResponse.json({ 
      error: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()
    
    // Fetch requests from property_listing_requests table
    const { data, error } = await supabase
      .from("property_listing_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      requests: data || [] 
    })

  } catch (error) {
    console.error("Error fetching property listing requests:", error)
    return NextResponse.json({ 
      error: `Failed to fetch requests: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
