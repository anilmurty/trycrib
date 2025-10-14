import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seller_id, agent_email, property_id, request_type, property_address, property_city, property_state, property_zip, message } = body

    // Use service role client to bypass RLS for POST operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
    // Use service role client to bypass RLS for GET operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { requestId, status, agentNotes } = body

    if (!requestId || !status) {
      return NextResponse.json({ 
        error: "Request ID and status are required" 
      }, { status: 400 })
    }

            if (!['listing_requested', 'listing_pending', 'rejected', 'listed', 'approval_pending'].includes(status)) {
              return NextResponse.json({ 
                error: "Invalid status. Must be one of: listing_requested, listing_pending, rejected, listed, approval_pending" 
              }, { status: 400 })
            }

    // Use service role client to bypass RLS for PUT operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the request status
    const { data, error } = await supabase
      .from("property_listing_requests")
      .update({
        status,
        agent_notes: agentNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    // If status is 'listed', create the actual property record
    if (status === 'listed') {
      const requestData = data[0]
      
      // Create property record from the request and setup data
      const propertyData = {
        title: requestData.property_setup_data?.title || requestData.property_address,
        description: requestData.property_setup_data?.description || '',
        address: requestData.property_address,
        city: requestData.property_city,
        state: requestData.property_state,
        zip_code: requestData.property_zip,
        listing_price: requestData.property_setup_data?.listing_price || 0,
        price_per_night: requestData.property_setup_data?.price_per_night || 0,
        bedrooms: requestData.property_setup_data?.bedrooms || 0,
        bathrooms: requestData.property_setup_data?.bathrooms || 0,
        square_feet: requestData.property_setup_data?.square_feet || 0,
        property_type: requestData.property_setup_data?.property_type || 'house',
        year_built: requestData.property_setup_data?.year_built || null,
        lot_size: requestData.property_setup_data?.lot_size || null,
        seller_id: requestData.seller_id,
        is_active: true,
        agent_created: true,
        created_by_agent: true
      }

      const { data: newProperty, error: propertyError } = await supabase
        .from("properties")
        .insert(propertyData)
        .select()

      if (propertyError) {
        console.error("Error creating property:", propertyError)
        return NextResponse.json({ 
          error: `Failed to create property: ${propertyError.message}` 
        }, { status: 500 })
      }

      console.log("Property created successfully:", newProperty[0].id)
    }

    console.log("Request updated successfully:", requestId, "to status:", status)
    return NextResponse.json({ 
      success: true, 
      message: `Request ${status} successfully`,
      data: data[0]
    })

  } catch (error) {
    console.error("Error updating request:", error)
    return NextResponse.json({ 
      error: `Failed to update request: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { requestId, propertySetupData, agentNotes } = body

    if (!requestId || !propertySetupData) {
      return NextResponse.json({ 
        error: "Request ID and property setup data are required" 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS for PATCH operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the request with property setup data
    const { data, error } = await supabase
      .from("property_listing_requests")
      .update({
        status: 'approval_pending',
        property_setup_data: propertySetupData,
        agent_notes: agentNotes || null,
        setup_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    console.log("Property setup completed for request:", requestId)
    return NextResponse.json({ 
      success: true, 
      message: "Property setup completed successfully",
      data: data[0]
    })

  } catch (error) {
    console.error("Error completing property setup:", error)
    return NextResponse.json({ 
      error: `Failed to complete property setup: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('id')
    const action = searchParams.get('action') || 'withdraw' // 'withdraw' or 'remove'

    if (!requestId) {
      return NextResponse.json({ 
        error: "Request ID is required" 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS for DELETE operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete the request from property_listing_requests table
    const { data, error } = await supabase
      .from("property_listing_requests")
      .delete()
      .eq("id", requestId)
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}` 
      }, { status: 500 })
    }

    const actionMessage = action === 'remove' ? 'Request removed successfully' : 'Request withdrawn successfully'
    console.log(`${actionMessage}:`, requestId)
    console.log("Deleted records:", data)
    return NextResponse.json({ 
      success: true, 
      message: actionMessage
    })

  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ 
      error: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}