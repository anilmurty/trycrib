import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    console.log("=== ONBOARDING SET-ROLE API CALLED ===")
    
    const { userId } = await auth()
    console.log("User ID from auth:", userId)

    if (!userId) {
      console.log("No userId found, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, agentInfo } = await request.json()
    console.log("Role from request:", role)
    console.log("Agent info from request:", agentInfo)

    if (!role || !["buyer", "seller", "agent"].includes(role)) {
      console.log("Invalid role:", role)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = await createClient()
    console.log("Supabase client created")

    // Get user details from Clerk (needed for both creating and updating profiles)
    const user = await currentUser()
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com"
    const userFullName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.firstName || user?.lastName || null

    // First, check if the profile exists
    console.log("Checking for existing profile...")
    const { data: existingProfile, error: profileCheckError } = await supabase.from("profiles").select("id").eq("id", userId).single()
    console.log("Profile check result:", { existingProfile, profileCheckError })

    if (!existingProfile) {
      // Profile doesn't exist, create it first
      console.log("Profile not found, creating profile for user", userId)
      
      console.log("Creating profile with data:", { userId, userEmail, userFullName, role })
      const { error: createError } = await supabase.from("profiles").insert({
        id: userId,
        email: userEmail,
        full_name: userFullName,
        role: role,
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

    // Create the appropriate profile (buyer_profiles, seller_profiles, or agent_profiles)
    console.log("Creating role-specific profile for role:", role)
    if (role === "buyer") {
      console.log("Creating buyer profile...")
      const { error: buyerError } = await supabase.from("buyer_profiles").upsert({
        id: userId,
        email: userEmail,
        agent_name: agentInfo?.name || null,
        agent_email: agentInfo?.email || null,
        agent_phone: agentInfo?.phone || null,
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
        email: userEmail,
        agent_name: agentInfo?.name || null,
        agent_email: agentInfo?.email || null,
        agent_phone: agentInfo?.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (sellerError) {
        console.error("Error creating seller profile:", sellerError)
        return NextResponse.json({ error: "Failed to create seller profile" }, { status: 500 })
      }
      console.log("Seller profile created successfully")
    } else if (role === "agent") {
      console.log("Creating agent profile...")
      console.log("Agent profile data:", { id: userId, email: userEmail })
      
      // Use service role client to bypass RLS (since Clerk auth doesn't work with Supabase RLS)
      const serviceSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { error: agentError, data: agentData } = await serviceSupabase.from("agent_profiles").upsert({
        id: userId,
        email: userEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (agentError) {
        console.error("Error creating agent profile:", agentError)
        console.error("Error details:", JSON.stringify(agentError, null, 2))
        return NextResponse.json({ 
          error: "Failed to create agent profile",
          details: agentError.message || JSON.stringify(agentError)
        }, { status: 500 })
      }
      console.log("Agent profile created successfully:", agentData)
    }

    // Check if this user was invited and mark invitation as accepted
    // Use service role client to bypass RLS for checking invitations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (userEmail && (role === "buyer" || role === "seller")) {
      const { data: invitations } = await serviceSupabase
        .from("client_invitations")
        .select("*")
        .eq("email", userEmail.toLowerCase())
        .eq("role", role)
        .eq("status", "pending")

      if (invitations && invitations.length > 0) {
        // Update pending invitations for this email and role to accepted
        await serviceSupabase
          .from("client_invitations")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("email", userEmail.toLowerCase())
          .eq("role", role)
          .eq("status", "pending")
        
        console.log(`Marked ${invitations.length} invitation(s) as accepted for ${userEmail} (${role})`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
