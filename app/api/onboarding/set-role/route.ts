import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    console.log("=== ONBOARDING SET-ROLE API CALLED ===")
    
    const { userId } = await auth()
    console.log("User ID from auth:", userId)

    if (!userId) {
      console.log("No userId found, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()
    console.log("Role from request:", role)

    if (!role || (role !== "buyer" && role !== "seller")) {
      console.log("Invalid role:", role)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = await createClient()
    console.log("Supabase client created")

    // First, check if the profile exists
    console.log("Checking for existing profile...")
    const { data: existingProfile, error: profileCheckError } = await supabase.from("profiles").select("id").eq("id", userId).single()
    console.log("Profile check result:", { existingProfile, profileCheckError })

    if (!existingProfile) {
      // Profile doesn't exist, create it first
      console.log("Profile not found, creating profile for user", userId)
      
      // Get user details from Clerk
      const user = await currentUser()
      const userEmail = user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com"
      const userFullName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.firstName || user?.lastName || null

      console.log("Creating profile with data:", { userId, userEmail, userFullName, role })
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
      console.log("Profile created successfully")
    } else {
      // Profile exists, update the role
      const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", userId)

      if (updateError) {
        console.error("Error updating profile role:", updateError)
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
      }
    }

    // Create the appropriate profile (buyer_profiles or seller_profiles)
    console.log("Creating role-specific profile for role:", role)
    if (role === "buyer") {
      console.log("Creating buyer profile...")
      const { error: buyerError } = await supabase.from("buyer_profiles").upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (buyerError) {
        console.error("Error creating buyer profile:", buyerError)
        return NextResponse.json({ error: "Failed to create buyer profile" }, { status: 500 })
      }
      console.log("Buyer profile created successfully")
    } else if (role === "seller") {
      console.log("Creating seller profile...")
      const { error: sellerError } = await supabase.from("seller_profiles").upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (sellerError) {
        console.error("Error creating seller profile:", sellerError)
        return NextResponse.json({ error: "Failed to create seller profile" }, { status: 500 })
      }
      console.log("Seller profile created successfully")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
