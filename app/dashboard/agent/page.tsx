import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { AgentDashboard } from "@/components/agent/agent-dashboard"

export default async function AgentDashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/auth?tab=login")
  }

  const supabase = await createClient()
  
  // Get user profile and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (!profile || profile.role !== "agent") {
    redirect("/dashboard")
  }

  // Get agent profile
  const { data: agentProfile } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  return (
    <AgentDashboard 
      userId={userId} 
      profile={profile} 
      agentProfile={agentProfile}
    />
  )
}
