import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { sendStayRequestEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { buyer_id, property_id, check_in, check_out, message } = body

    if (!buyer_id || !property_id) {
      return NextResponse.json({ 
        error: "buyer_id and property_id are required" 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS for POST operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get buyer profile with agent info
    const { data: buyerProfile, error: buyerError } = await supabase
      .from("buyer_profiles")
      .select(`
        agent_email,
        agent_name,
        profiles!buyer_profiles_id_fkey (
          full_name,
          email
        )
      `)
      .eq("id", buyer_id)
      .single()

    if (buyerError || !buyerProfile) {
      console.error("Error fetching buyer profile:", buyerError)
      return NextResponse.json({ 
        error: `Failed to fetch buyer profile: ${buyerError?.message || 'Buyer profile not found'}` 
      }, { status: 500 })
    }

    if (!buyerProfile.agent_email) {
      return NextResponse.json({ 
        error: "No agent assigned. Please add your agent information in settings." 
      }, { status: 400 })
    }

    // Get property details with images
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("title, address, city, state, zip_code, images, original_image_urls, id")
      .eq("id", property_id)
      .single()

    if (propertyError || !property) {
      console.error("Error fetching property:", propertyError)
      return NextResponse.json({ 
        error: `Failed to fetch property: ${propertyError?.message || 'Property not found'}` 
      }, { status: 500 })
    }

    // Insert stay request into database
    const { data: stayRequest, error: insertError } = await supabase
      .from("stay_requests")
      .insert([{
        buyer_id,
        property_id,
        check_in: check_in || null,
        check_out: check_out || null,
        message: message || null,
        status: "pending"
      }])
      .select()
      .single()

    if (insertError) {
      console.error("Database error:", insertError)
      return NextResponse.json({ 
        error: `Database error: ${insertError.message}` 
      }, { status: 500 })
    }

    // Send email to buyer's agent
    try {
      const buyerName = (buyerProfile.profiles as any)?.full_name || "Your client"
      const buyerEmail = (buyerProfile.profiles as any)?.email || ""

      console.log("Attempting to send stay request email to:", buyerProfile.agent_email)
      console.log("Resend API Key present:", !!process.env.RESEND_API_KEY)
      console.log("Resend From Email:", process.env.RESEND_FROM_EMAIL || "TryCrib <noreply@trycrib.com>")

      // Get property image (prefer images over original_image_urls)
      const propertyImage = property.images && property.images.length > 0 
        ? property.images[0] 
        : property.original_image_urls && property.original_image_urls.length > 0
        ? property.original_image_urls[0]
        : null

      // Construct public property URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      const propertyUrl = `${baseUrl}/properties/${property.id}`

      const emailResult = await sendStayRequestEmail({
        agentEmail: buyerProfile.agent_email,
        agentName: buyerProfile.agent_name || "Agent",
        buyerName,
        buyerEmail,
        propertyAddress: property.address,
        propertyCity: property.city,
        propertyState: property.state,
        propertyTitle: property.title,
        propertyImage: propertyImage || undefined,
        propertyUrl,
        checkInDate: check_in,
        checkOutDate: check_out,
        message: message || undefined,
      })

      console.log("Stay request email sent successfully:", emailResult)
    } catch (emailError: any) {
      console.error("Error sending stay request email:", emailError)
      console.error("Error details:", {
        message: emailError?.message,
        name: emailError?.name,
        stack: emailError?.stack,
        response: emailError?.response,
      })
      // Don't fail the request if email fails, but log it
      // The stay request is already saved in the database
    }

    console.log("Stay request created successfully:", stayRequest)
    return NextResponse.json({ 
      success: true, 
      message: "Stay request sent to your agent successfully",
      data: stayRequest
    })

  } catch (error) {
    console.error("Error handling stay request:", error)
    return NextResponse.json({ 
      error: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const buyer_id = searchParams.get("buyer_id")

    // Use service role client to bypass RLS for GET operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from("stay_requests")
      .select(`
        *,
        properties (
          title,
          address,
          city,
          state,
          zip_code
        )
      `)
      .order("created_at", { ascending: false })

    if (buyer_id) {
      query = query.eq("buyer_id", buyer_id)
    }

    const { data, error } = await query

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
    console.error("Error fetching stay requests:", error)
    return NextResponse.json({ 
      error: `Failed to fetch requests: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
