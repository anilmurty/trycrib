import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || (role !== "buyer" && role !== "seller")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = await createClient()

    // First, check if the profile exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (!existingProfile) {
      // Profile doesn't exist, create it first
      console.log("Profile not found, creating profile for user", userId)
      
      // Get user details from Clerk
      const user = await currentUser()
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com"
      const userFullName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.firstName || user?.lastName || null

      const { error: createError } = await supabase.from("profiles").insert({
        id: userId,
        email: userEmail,
        full_name: userFullName,
        role: role,
        verification_status: "pending",
      })

      if (createError) {
        console.error("Error creating profile:", createError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }
    } else {
      // Profile exists, update the role
      const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", userId)

      if (updateError) {
        console.error("Error updating profile role:", updateError)
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
      }
    }

    // Create the appropriate profile (buyer_profiles or seller_profiles)
    if (role === "buyer") {
      const { error: buyerError } = await supabase.from("buyer_profiles").upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (buyerError) {
        console.error("Error creating buyer profile:", buyerError)
      }
    } else if (role === "seller") {
      const { error: sellerError } = await supabase.from("seller_profiles").upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (sellerError) {
        console.error("Error creating seller profile:", sellerError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
