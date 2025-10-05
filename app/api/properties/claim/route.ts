import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.log("No userId found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { propertyId, claimReason } = await request.json()
    console.log("Claim request:", { propertyId, claimReason, userId })

    if (!propertyId) {
      console.log("No propertyId provided")
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is a seller
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    console.log("Profile check:", { profile, profileError })

    if (profileError) {
      console.error("Profile error:", profileError)
      return NextResponse.json({ error: "Failed to verify user profile" }, { status: 500 })
    }

    if (profile?.role !== "seller") {
      console.log("User is not a seller:", profile?.role)
      return NextResponse.json({ error: "Only sellers can claim properties" }, { status: 403 })
    }

    // Submit the claim
    console.log("Calling claim_property RPC with:", {
      target_property_id: propertyId,
      claimant_user_id: userId,
      claim_reason: claimReason || null
    })

    const { data, error } = await supabase.rpc('claim_property', {
      target_property_id: propertyId,
      claimant_user_id: userId,
      claim_reason: claimReason || null
    })

    console.log("RPC result:", { data, error })

    if (error) {
      console.error("Error claiming property:", error)
      return NextResponse.json({ error: "Failed to claim property" }, { status: 500 })
    }

    if (!data) {
      console.log("Claim returned false - property may already be claimed")
      return NextResponse.json({ error: "Property claim failed. This property may already be claimed." }, { status: 400 })
    }

    console.log("Claim successful")
    return NextResponse.json({ 
      success: true, 
      message: "Property claim submitted successfully! An admin will review your claim." 
    })

  } catch (error) {
    console.error("Error in property claim API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
