import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendConfirmAgentEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get agent profile to get their email, name, and phone
    const { data: agentProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    const { data: agentProfileDetails } = await supabase
      .from("agent_profiles")
      .select("phone")
      .eq("id", userId)
      .single()

    const agentEmail = agentProfile?.email || ""
    const agentFirstName = agentProfile?.full_name?.split(' ')[0] || agentEmail?.split('@')[0] || "Your agent"
    const agentName = agentProfile?.full_name || agentEmail
    const agentPhone = agentProfileDetails?.phone || null

    // Fetch invited clients for this agent
    const { data: invitationsData, error: invitationsError } = await supabase
      .from("client_invitations")
      .select("*")
      .eq("agent_id", userId)
      .order("invited_at", { ascending: false })

    if (invitationsError) {
      console.error("Error fetching invitations:", invitationsError)
      return NextResponse.json({ 
        error: "Failed to fetch invitations",
        invitations: []
      }, { status: 500 })
    }

    console.log(`Found ${invitationsData?.length || 0} invitations for agent ${userId}`)
    console.log("Raw invitations data:", invitationsData?.map((inv: any) => ({ 
      id: inv.id, 
      email: inv.email, 
      status: inv.status, 
      role: inv.role,
      agent_id: inv.agent_id 
    })))

    // Process each invitation to check if user exists and has agent set
    const processedInvitations = await Promise.all(
      (invitationsData || []).map(async (invitation) => {
        // Check if user exists by email
        const { data: existingUser, error: userCheckError } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("email", invitation.email.toLowerCase())
          .maybeSingle()

        if (userCheckError) {
          console.error(`Error checking user for ${invitation.email}:`, userCheckError)
        }

        if (!existingUser) {
          // User doesn't exist, return invitation as-is (pending)
          console.log(`User ${invitation.email} does not exist, returning pending invitation with status: ${invitation.status}`)
          return {
            ...invitation,
            status: invitation.status || "pending" // Ensure status is set
          }
        }

        // User exists - check if they have this agent set
        const profileTable = invitation.role === "buyer" ? "buyer_profiles" : "seller_profiles"
        const { data: roleProfile, error: roleProfileError } = await supabase
          .from(profileTable)
          .select("agent_email")
          .eq("id", existingUser.id)
          .maybeSingle()

        if (roleProfileError) {
          console.error(`Error checking role profile for ${invitation.email}:`, roleProfileError)
        }

        if (roleProfile?.agent_email?.toLowerCase() === agentEmail.toLowerCase()) {
          // User has this agent set - automatically add as client and mark invitation as accepted
          // Update the role profile to ensure all agent info is set
          // Set agent_confirmed to false - user needs to confirm
          await supabase
            .from(profileTable)
            .update({
              agent_email: agentEmail,
              agent_name: agentName,
              agent_phone: agentPhone,
              agent_confirmed: false, // Require user confirmation
              updated_at: new Date().toISOString()
            })
            .eq("id", existingUser.id)

          // Mark invitation as accepted
          await supabase
            .from("client_invitations")
            .update({
              status: "accepted",
              accepted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("id", invitation.id)

          return {
            ...invitation,
            status: "accepted",
            accepted_at: new Date().toISOString(),
            user_exists: true,
            agent_confirmed: true
          }
        } else {
          // User exists but doesn't have this agent set (or has different agent)
          // Send confirmation email asking them to confirm/add this agent
          const daysSinceInvited = (new Date().getTime() - new Date(invitation.invited_at).getTime()) / (1000 * 60 * 60 * 24)
          const confirmationEmailSent = (invitation as any).confirmation_email_sent || false
          
          // Only send email if:
          // 1. Invitation is still pending
          // 2. It's been less than 7 days since invitation
          // 3. We haven't sent confirmation email yet
          const shouldSendEmail = invitation.status === "pending" && daysSinceInvited < 7 && !confirmationEmailSent
          
          if (shouldSendEmail) {
            try {
              await sendConfirmAgentEmail({
                agentFirstName,
                agentEmail,
                agentName,
                clientFirstName: invitation.first_name,
                clientLastName: invitation.last_name || "",
                clientEmail: invitation.email,
                clientRole: invitation.role as "buyer" | "seller"
              })
              
              // Update invitation to track that we sent confirmation email
              await supabase
                .from("client_invitations")
                .update({
                  confirmation_email_sent: true,
                  updated_at: new Date().toISOString()
                })
                .eq("id", invitation.id)
            } catch (emailError) {
              console.error("Error sending confirmation email:", emailError)
              // Continue even if email fails
            }
          }

          return {
            ...invitation,
            status: invitation.status || "pending", // Preserve original status
            user_exists: true,
            agent_confirmed: false,
            needs_confirmation: true,
            confirmation_email_sent: shouldSendEmail ? true : confirmationEmailSent
          }
        }
      })
    )

    console.log(`Returning ${processedInvitations.length} processed invitations`)
    console.log(`Invitation statuses:`, processedInvitations.map((inv: any) => ({ email: inv.email, status: inv.status })))

    return NextResponse.json({ 
      invitations: processedInvitations
    })
  } catch (error) {
    console.error("Error in invited clients endpoint:", error)
    return NextResponse.json({ 
      error: `Failed to fetch invitations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      invitations: []
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get("id")

    if (!invitationId) {
      return NextResponse.json({ 
        error: "Invitation ID is required" 
      }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify that the invitation belongs to this agent
    const { data: invitation, error: fetchError } = await supabase
      .from("client_invitations")
      .select("id, agent_id, status")
      .eq("id", invitationId)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ 
        error: "Invitation not found" 
      }, { status: 404 })
    }

    if (invitation.agent_id !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized - invitation does not belong to this agent" 
      }, { status: 403 })
    }

    // Only allow deletion of pending invitations
    if (invitation.status !== "pending") {
      return NextResponse.json({ 
        error: "Only pending invitations can be deleted" 
      }, { status: 400 })
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from("client_invitations")
      .delete()
      .eq("id", invitationId)

    if (deleteError) {
      console.error("Error deleting invitation:", deleteError)
      return NextResponse.json({ 
        error: "Failed to delete invitation" 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Invitation deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting invitation:", error)
    return NextResponse.json({ 
      error: `Failed to delete invitation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
