import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { property_address } = await request.json()

    if (!property_address || !property_address.trim()) {
      return NextResponse.json(
        { error: "Property address is required" },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user has reached the limit of 20 requests
    const { count, error: countError } = await supabase
      .from("buyer_listing_requests")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", userId)

    if (countError) {
      console.error("Error counting buyer listing requests:", countError)
      return NextResponse.json(
        { error: "Failed to check request limit" },
        { status: 500 }
      )
    }

    if (count && count >= 20) {
      return NextResponse.json(
        { error: "You have reached the maximum limit of 20 property addresses. Please remove some addresses before adding new ones." },
        { status: 400 }
      )
    }

    // Insert the listing request
    const { data, error } = await supabase
      .from("buyer_listing_requests")
      .insert({
        buyer_id: userId,
        property_address: property_address.trim(),
        status: "pending"
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating buyer listing request:", error)
      return NextResponse.json(
        { error: "Failed to create listing request" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error in buyer listing request API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user's listing requests
    const { data, error } = await supabase
      .from("buyer_listing_requests")
      .select("*")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching buyer listing requests:", error)
      return NextResponse.json(
        { error: "Failed to fetch listing requests" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in buyer listing request API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
