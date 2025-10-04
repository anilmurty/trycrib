import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard"

export default async function BuyerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role === "seller") {
    redirect("/dashboard/seller")
  }

  return <BuyerDashboard userId={user.id} profile={profile} />
}
