import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SellerDashboard } from "@/components/seller/seller-dashboard"

export default async function SellerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "seller") {
    redirect("/dashboard/buyer")
  }

  return <SellerDashboard userId={user.id} profile={profile} />
}
