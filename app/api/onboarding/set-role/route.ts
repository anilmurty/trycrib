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

    const body = await request.json()
    const { role, agentInfo } = body
    console.log("Role from request:", role)
    console.log("Agent info from request:", agentInfo)
    console.log("Full request body:", JSON.stringify(body, null, 2))

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
    console.log("Checking if should send agent email:", { 
      hasInvitation, 
      agentInfo: agentInfo ? { email: agentInfo.email, name: agentInfo.name } : null,
      role,
      agentInfoType: typeof agentInfo,
      agentInfoIsNull: agentInfo === null,
      agentInfoIsUndefined: agentInfo === undefined
    })
    
    // Check if agentInfo exists, is not null/undefined, and has an email
    const hasAgentInfo = agentInfo && typeof agentInfo === 'object' && agentInfo.email
    
    console.log("Agent email check:", {
      hasInvitation,
      hasAgentInfo,
      role,
      agentInfo: agentInfo ? { email: agentInfo.email, name: agentInfo.name } : null,
      willSendEmail: !hasInvitation && hasAgentInfo && (role === "buyer" || role === "seller")
    })
    
    if (!hasInvitation && hasAgentInfo && (role === "buyer" || role === "seller")) {
      console.log("Sending agent onboarding notification email...")
      try {
        // Check if agent exists in the system
        const { data: agentProfile, error: agentProfileError } = await serviceSupabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("email", agentInfo.email.toLowerCase())
          .maybeSingle()

        const agentExists = !!agentProfile
        const agentName = agentProfile?.full_name || agentInfo.name || null

        console.log("Agent profile check:", { 
          agentEmail: agentInfo.email, 
          agentExists, 
          agentName,
          agentProfileError: agentProfileError ? JSON.stringify(agentProfileError) : null
        })

        // Send notification email to agent
        const emailResult = await sendAgentOnboardingNotificationEmail({
          agentEmail: agentInfo.email,
          agentName: agentName || undefined,
          clientName: userFullName || userEmail.split('@')[0],
          clientEmail: userEmail,
          clientRole: role as "buyer" | "seller",
          agentExists
        })

        console.log(`Successfully sent onboarding notification email to agent ${agentInfo.email} (exists: ${agentExists}), email ID: ${emailResult.id}`)
      } catch (emailError: any) {
        // Log error but don't fail the onboarding process
        console.error("Error sending agent onboarding notification email:", emailError)
        console.error("Email error details:", JSON.stringify(emailError, null, 2))
        console.error("Email error message:", emailError?.message)
        console.error("Email error stack:", emailError?.stack)
      }
    } else {
      console.log("Skipping agent email:", {
        reason: hasInvitation ? "has invitation" : !agentInfo ? "no agentInfo" : !agentInfo.email ? "no agent email" : `role is ${role}`,
        hasInvitation,
        hasAgentInfo,
        role,
        agentInfoEmail: agentInfo?.email
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
