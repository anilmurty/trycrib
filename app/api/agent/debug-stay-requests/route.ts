import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

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

    // Get the agent's profile
    const { data: agentProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single()

    // Get all stay requests
    const { data: allRequests } = await supabase
      .from("stay_requests")
      .select(`
        id,
        buyer_id,
        status,
        created_at,
        buyer_profiles (
          email,
          agent_email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    // Get all buyers with agent_email
    const { data: buyers } = await supabase
      .from("buyer_profiles")
      .select("id, agent_email, email")
      .not("agent_email", "is", null)
      .limit(20)

    return NextResponse.json({ 
      agentEmail: agentProfile?.email,
      totalStayRequests: allRequests?.length || 0,
      allStayRequests: allRequests,
      buyersWithAgents: buyers,
      debug: {
        agentUserId: userId,
        agentEmail: agentProfile?.email
      }
    })

  } catch (error) {
    console.error("Error in debug API:", error)
    return NextResponse.json({ 
      error: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
