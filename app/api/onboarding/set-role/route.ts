import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendAgentOnboardingNotificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    console.log("=== ONBOARDING SET-ROLE API CALLED ===")
    
    const { userId } = await auth()
    console.log("User from auth:", userId)

    if (!userId) {
      console.log("No user found, returning 401")
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

    // Get user details from Clerk
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
    
    // Use service role client to bypass RLS for role-specific profiles
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if this user was invited BEFORE creating profile
    // This ensures invitation agent info takes precedence over manually entered info
    let invitationAgentInfo = null
    let hasInvitation = false
    
    if (userEmail && (role === "buyer" || role === "seller")) {
      const { data: invitations } = await serviceSupabase
        .from("client_invitations")
        .select("*")
        .eq("email", userEmail.toLowerCase())
        .eq("role", role)
        .eq("status", "pending")

      if (invitations && invitations.length > 0) {
        hasInvitation = true
        const invitation = invitations[0]
        const { data: agentProfile } = await serviceSupabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", invitation.agent_id)
          .single()

        const { data: agentProfileDetails } = await serviceSupabase
          .from("agent_profiles")
          .select("phone")
          .eq("id", invitation.agent_id)
          .single()

        invitationAgentInfo = {
          email: agentProfile?.email || "",
          name: agentProfile?.full_name || agentProfile?.email || "",
          phone: agentProfileDetails?.phone || null,
          confirmed: false // Require user confirmation
        }
      }
    }
    
    if (role === "buyer") {
      console.log("Creating buyer profile...")
      // Use invitation agent info if available, otherwise use manually entered info
      const finalAgentInfo = invitationAgentInfo || (agentInfo ? {
        name: agentInfo.name,
        email: agentInfo.email,
        phone: agentInfo.phone,
        confirmed: true // User entered it themselves
      } : null)

      const { error: buyerError } = await serviceSupabase.from("buyer_profiles").upsert({
        id: userId,
        agent_name: finalAgentInfo?.name || null,
        agent_email: finalAgentInfo?.email || null,
        agent_phone: finalAgentInfo?.phone || null,
        agent_confirmed: finalAgentInfo?.confirmed ?? false,
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
      // Use invitation agent info if available, otherwise use manually entered info
      const finalAgentInfo = invitationAgentInfo || (agentInfo ? {
        name: agentInfo.name,
        email: agentInfo.email,
        phone: agentInfo.phone,
        confirmed: true // User entered it themselves
      } : null)

      const { error: sellerError } = await serviceSupabase.from("seller_profiles").upsert({
        id: userId,
        agent_name: finalAgentInfo?.name || null,
        agent_email: finalAgentInfo?.email || null,
        agent_phone: finalAgentInfo?.phone || null,
        agent_confirmed: finalAgentInfo?.confirmed ?? false,
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

    // Mark invitation as accepted if there was one
    if (hasInvitation && userEmail && (role === "buyer" || role === "seller")) {
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
      
      console.log(`Marked invitation(s) as accepted for ${userEmail} (${role})`)
    }

    // Send email to agent if agent info was manually provided (not from invitation)
    // Only send if agentInfo exists and we didn't use invitation agent info
    if (!hasInvitation && agentInfo && agentInfo.email && (role === "buyer" || role === "seller")) {
      try {
        // Check if agent exists in the system
        const { data: agentProfile } = await serviceSupabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("email", agentInfo.email.toLowerCase())
          .single()

        const agentExists = !!agentProfile
        const agentName = agentProfile?.full_name || agentInfo.name || null

        // Send notification email to agent
        await sendAgentOnboardingNotificationEmail({
          agentEmail: agentInfo.email,
          agentName: agentName || undefined,
          clientName: userFullName || userEmail.split('@')[0],
          clientEmail: userEmail,
          clientRole: role as "buyer" | "seller",
          agentExists
        })

        console.log(`Sent onboarding notification email to agent ${agentInfo.email} (exists: ${agentExists})`)
      } catch (emailError) {
        // Log error but don't fail the onboarding process
        console.error("Error sending agent onboarding notification email:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
