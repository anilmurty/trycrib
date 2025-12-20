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

    // Use service role client to bypass RLS (since we're using Clerk auth)
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    // Use service role client to bypass RLS (since we're using Clerk auth)
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
