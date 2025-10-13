import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { BuyerAgentDashboard } from "@/components/agent/buyer-agent-dashboard"

export default async function BuyerAgentDashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createClient()
  
  // Get user profile and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (!profile || profile.role !== "buyer_agent") {
    redirect("/dashboard")
  }

  // Get buyer agent profile
  const { data: agentProfile } = await supabase
    .from("buyer_agent_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  return (
    <BuyerAgentDashboard 
      userId={userId} 
      profile={profile} 
      agentProfile={agentProfile}
    />
  )
}
