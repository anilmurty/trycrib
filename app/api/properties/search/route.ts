import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is a seller
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profile?.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can search for properties" }, { status: 403 })
    }

    // Search for properties by address
    const { data, error } = await supabase.rpc('get_properties_by_address', {
      search_address: address
    })

    if (error) {
      console.error("Error searching properties:", error)
      return NextResponse.json({ error: "Failed to search properties" }, { status: 500 })
    }

    return NextResponse.json({ properties: data || [] })

  } catch (error) {
    console.error("Error in property search API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
