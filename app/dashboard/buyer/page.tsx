import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard"

export default async function BuyerDashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (profile?.role === "seller") {
    redirect("/dashboard/seller")
  }

  return <BuyerDashboard userId={userId} profile={profile} />
}
