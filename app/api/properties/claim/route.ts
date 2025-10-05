import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { propertyId, claimReason } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is a seller
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profile?.role !== "seller") {
      return NextResponse.json({ error: "Only sellers can claim properties" }, { status: 403 })
    }

    // Submit the claim
    const { data, error } = await supabase.rpc('claim_property', {
      target_property_id: propertyId,
      claimant_user_id: userId,
      claim_reason: claimReason || null
    })

    if (error) {
      console.error("Error claiming property:", error)
      return NextResponse.json({ error: "Failed to claim property" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Property claim failed. This property may already be claimed." }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Property claim submitted successfully! An admin will review your claim." 
    })

  } catch (error) {
    console.error("Error in property claim API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
