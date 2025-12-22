import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

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

    // Get user's email and role
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("email, role")
      .eq("id", userId)
      .single()

    if (!userProfile?.email || !userProfile?.role) {
      return NextResponse.json({ 
        invitations: []
      })
    }

    // Fetch pending invitations for this user
    const { data: invitations, error: invitationsError } = await supabase
      .from("client_invitations")
      .select("*")
      .eq("email", userProfile.email.toLowerCase())
      .eq("role", userProfile.role)
      .eq("status", "pending")
      .order("invited_at", { ascending: false })

    if (invitationsError) {
      console.error("Error fetching pending invitations:", invitationsError)
      return NextResponse.json({ 
        invitations: []
      })
    }

    // For each invitation, get agent details
    const invitationsWithAgentDetails = await Promise.all(
      (invitations || []).map(async (invitation) => {
        const { data: agentProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", invitation.agent_id)
          .single()

        const { data: agentProfileDetails } = await supabase
          .from("agent_profiles")
          .select("phone")
          .eq("id", invitation.agent_id)
          .maybeSingle()

        return {
          ...invitation,
          agent: {
            email: agentProfile?.email || "",
            name: agentProfile?.full_name || "",
            phone: agentProfileDetails?.phone || null
          }
        }
      })
    )

    return NextResponse.json({ 
      invitations: invitationsWithAgentDetails
    })
  } catch (error) {
    console.error("Error in pending invitations endpoint:", error)
    return NextResponse.json({ 
      error: `Failed to fetch invitations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      invitations: []
    }, { status: 500 })
  }
}
