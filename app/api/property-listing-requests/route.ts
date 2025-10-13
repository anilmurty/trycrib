import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seller_id, agent_email, property_id, request_type, property_address, property_city, property_state, property_zip, message } = body

    const supabase = createClient()

    // For now, let's just log the request since we don't have the table yet
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

    // TODO: Insert into property_listing_requests table once it's created
    // For now, we'll simulate success
    return NextResponse.json({ 
      success: true, 
      message: "Request received successfully" 
    })

  } catch (error) {
    console.error("Error handling property listing request:", error)
    return NextResponse.json({ 
      error: "Failed to process request" 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()
    
    // TODO: Fetch requests from property_listing_requests table once it's created
    // For now, return empty array
    return NextResponse.json({ 
      requests: [] 
    })

  } catch (error) {
    console.error("Error fetching property listing requests:", error)
    return NextResponse.json({ 
      error: "Failed to fetch requests" 
    }, { status: 500 })
  }
}
