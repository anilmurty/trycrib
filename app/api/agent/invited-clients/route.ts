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

    // Process each invitation to check if user exists and has agent set
    const processedInvitations = await Promise.all(
      (invitationsData || []).map(async (invitation) => {
        // Check if user exists by email
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("email", invitation.email.toLowerCase())
          .single()

        if (!existingUser) {
          // User doesn't exist, return invitation as-is (pending)
          return invitation
        }

        // User exists - check if they have this agent set
        const profileTable = invitation.role === "buyer" ? "buyer_profiles" : "seller_profiles"
        const { data: roleProfile } = await supabase
          .from(profileTable)
          .select("agent_email")
          .eq("id", existingUser.id)
          .single()

        if (roleProfile?.agent_email?.toLowerCase() === agentEmail.toLowerCase()) {
          // User has this agent set - automatically add as client and mark invitation as accepted
          // Update the role profile to ensure all agent info is set
          await supabase
            .from(profileTable)
            .update({
              agent_email: agentEmail,
              agent_name: agentName,
              agent_phone: agentPhone,
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
            user_exists: true,
            agent_confirmed: false,
            needs_confirmation: true,
            confirmation_email_sent: shouldSendEmail ? true : confirmationEmailSent
          }
        }
      })
    )

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
