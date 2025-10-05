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
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, is_seed_property, seller_id")
      .eq("id", propertyId)
      .single()

    if (propertyError) {
      console.error("Property error:", propertyError)
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check existing claims
    const { data: existingClaims, error: claimsError } = await supabase
      .from("property_claims")
      .select("id, claim_status, claimant_id")
      .eq("property_id", propertyId)

    if (claimsError) {
      console.error("Claims error:", claimsError)
      return NextResponse.json({ error: "Failed to check claims" }, { status: 500 })
    }

    return NextResponse.json({
      property: {
        id: property.id,
        title: property.title,
        is_seed_property: property.is_seed_property,
        seller_id: property.seller_id
      },
      existing_claims: existingClaims || [],
      can_claim: property.is_seed_property && property.seller_id === null && existingClaims?.length === 0
    })

  } catch (error) {
    console.error("Error in property check API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
