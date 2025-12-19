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

    // Get the agent's profile to get their email
    const { data: agentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single()

    if (profileError || !agentProfile) {
      console.error("Error fetching agent profile:", profileError)
      return NextResponse.json({ 
        error: "Agent profile not found" 
      }, { status: 404 })
    }

    console.log("Agent email:", agentProfile.email)

    // First, get all clients (buyers) assigned to this agent
    const { data: clientsData } = await supabase
      .from("buyer_profiles")
      .select("id, agent_email")
      .eq("agent_email", agentProfile.email)

    const clientIds = clientsData?.map(c => c.id) || []
    console.log("Clients for agent:", clientIds.length, clientIds)

    // Fetch stay requests where buyer's agent_email matches this agent's email
    // OR where buyer_id is in the clients list (fallback for requests created before agent_email was set)
    // Note: buyer_id references profiles.id, so we need to join through profiles to get buyer_profiles
    const { data: requestsData, error: requestsError } = await supabase
      .from("stay_requests")
      .select(`
        id,
        property_id,
        buyer_id,
        check_in,
        check_out,
        status,
        created_at,
        message,
        properties (
          title,
          city,
          state,
          listing_price
        )
      `)
      .order("created_at", { ascending: false })

    if (requestsError) {
      console.error("Error fetching stay requests:", requestsError)
      return NextResponse.json({ 
        error: `Failed to fetch stay requests: ${requestsError.message}` 
      }, { status: 500 })
    }

    console.log("Total stay requests fetched:", requestsData?.length || 0)

    // Filter stay requests where buyer_id is in the clients list
    // (This works for both new and old requests)
    const filteredRequestIds = requestsData?.filter(request => 
      clientIds.includes(request.buyer_id)
    ).map(r => r.buyer_id) || []

    console.log("Filtered request buyer IDs:", filteredRequestIds.length)

    // Now fetch the full details with buyer_profiles for filtered requests
    let finalRequests: any[] = []
    if (filteredRequestIds.length > 0) {
      const { data: fullRequestsData, error: fullError } = await supabase
        .from("stay_requests")
        .select(`
          id,
          property_id,
          buyer_id,
          check_in,
          check_out,
          status,
          created_at,
          message,
          properties (
            title,
            city,
            state,
            listing_price
          )
        `)
        .in("buyer_id", filteredRequestIds)
        .order("created_at", { ascending: false })

      if (!fullError && fullRequestsData) {
        // Fetch buyer_profiles data separately
        // Also fetch profiles for full_name
        const { data: buyerProfilesData } = await supabase
          .from("buyer_profiles")
          .select("id, email, agent_email")
          .in("id", filteredRequestIds)

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", filteredRequestIds)

        const buyerProfilesMap = new Map(
          buyerProfilesData?.map(bp => [bp.id, bp]) || []
        )
        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        )

        // Combine stay requests with buyer_profiles and profiles data
        finalRequests = fullRequestsData.map(request => {
          const buyerProfile = buyerProfilesMap.get(request.buyer_id)
          const profile = profilesMap.get(request.buyer_id)
          return {
            ...request,
            buyer_profiles: {
              full_name: profile?.full_name || null,
              email: buyerProfile?.email || profile?.email || null,
              agent_email: buyerProfile?.agent_email || null
            }
          }
        })
      }
    }

    console.log("Final stay requests for agent:", finalRequests.length)

    return NextResponse.json({ 
      requests: finalRequests 
    })

  } catch (error) {
    console.error("Error in stay requests API:", error)
    return NextResponse.json({ 
      error: `Failed to fetch stay requests: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
