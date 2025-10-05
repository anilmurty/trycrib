import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check property details first
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, is_seed_property, seller_id")
      .eq("id", propertyId)
      .single()

    console.log("Property details:", { property, propertyError })

    if (propertyError) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check existing claims
    const { data: existingClaims, error: claimsError } = await supabase
      .from("property_claims")
      .select("id, claim_status, claimant_id")
      .eq("property_id", propertyId)

    console.log("Existing claims:", { existingClaims, claimsError })

    // Try to manually insert a claim to see what happens
    const { data: insertData, error: insertError } = await supabase
      .from("property_claims")
      .insert({
        property_id: propertyId,
        claimant_id: userId,
        claim_reason: "Test claim",
        claim_status: "pending"
      })
      .select()

    console.log("Manual insert result:", { insertData, insertError })

    return NextResponse.json({
      property,
      existing_claims: existingClaims,
      manual_insert: { insertData, insertError }
    })

  } catch (error) {
    console.error("Error in test claim API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
