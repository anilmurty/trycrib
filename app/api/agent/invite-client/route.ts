import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendInviteClientEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, role } = body

    if (!firstName || !email) {
      return NextResponse.json({ 
        error: "First name and email are required" 
      }, { status: 400 })
    }

    const clientRole = role === "seller" ? "seller" : "buyer"

    // Use service role client to get agent profile
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get agent profile to get their first name
    const { data: agentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single()

    if (profileError || !agentProfile) {
      console.error("Error fetching agent profile:", profileError)
      return NextResponse.json({ 
        error: "Agent profile not found" 
      }, { status: 404 })
    }

    // Extract first name from full_name
    const agentFirstName = agentProfile.full_name?.split(' ')[0] || agentProfile.email?.split('@')[0] || "Your agent"

    // Store invitation in database
    const invitationData: any = {
      agent_id: userId,
      first_name: firstName.trim(),
      last_name: lastName?.trim() || null,
      email: email.trim().toLowerCase(),
      role: clientRole,
      status: 'pending'
    }
    
    console.log("Storing invitation:", invitationData)
    
    const { data: insertedInvitation, error: inviteError } = await supabase
      .from("client_invitations")
      .insert([invitationData])
      .select()

    if (inviteError) {
      console.error("Error storing invitation:", inviteError)
      
      // If we get a PGRST204 error, it means PostgREST's schema cache doesn't know about the role column
      // This usually means the migration hasn't been run or PostgREST needs to refresh its cache
      if (inviteError.code === 'PGRST204' && inviteError.message?.includes('role')) {
        return NextResponse.json({ 
          error: `Database schema issue: The 'role' column is missing from the client_invitations table. Please run migration 067 (via /api/admin/run-migration-067) or manually execute scripts/067_ensure_client_invitations_role_column.sql in your Supabase SQL editor. After running the migration, PostgREST's schema cache will refresh automatically within a few minutes.` 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: `Failed to store invitation: ${inviteError.message}` 
      }, { status: 500 })
    }
    
    if (!insertedInvitation || insertedInvitation.length === 0) {
      return NextResponse.json({ 
        error: `Failed to store invitation: No data returned` 
      }, { status: 500 })
    }

    console.log("Invitation stored successfully:", insertedInvitation)

    // Send invitation email
    try {
      await sendInviteClientEmail({
        agentFirstName,
        agentEmail: agentProfile.email || "",
        clientFirstName: firstName,
        clientLastName: lastName || "",
        clientEmail: email,
        clientRole: clientRole,
      })

      return NextResponse.json({ 
        success: true,
        message: `We've invited ${firstName} to join TryCrib`,
        clientFirstName: firstName
      })
    } catch (emailError: any) {
      console.error("Error sending invitation email:", emailError)
      return NextResponse.json({ 
        error: `Failed to send invitation: ${emailError.message || 'Unknown error'}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in invite client endpoint:", error)
    return NextResponse.json({ 
      error: `Failed to send invitation: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
