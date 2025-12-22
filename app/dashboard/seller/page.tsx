import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { SellerDashboard } from "@/components/seller/seller-dashboard"

export default async function SellerDashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/auth")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (profile?.role !== "seller") {
    redirect("/dashboard/buyer")
  }

  return <SellerDashboard userId={userId} profile={profile} />
}
