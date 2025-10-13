import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { SellerAgentDashboard } from "@/components/agent/seller-agent-dashboard"

export default async function SellerAgentDashboardPage() {
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

  if (!profile || profile.role !== "seller_agent") {
    redirect("/dashboard")
  }

  // Get seller agent profile
  const { data: agentProfile } = await supabase
    .from("seller_agent_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  return (
    <SellerAgentDashboard 
      userId={userId} 
      profile={profile} 
      agentProfile={agentProfile}
    />
  )
}
