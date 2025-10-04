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

  let profile = null
  let retries = 0
  const maxRetries = 3

  while (!profile && retries < maxRetries) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (data) {
      profile = data
    } else if (error) {
      console.log("[v0] Profile not found, attempt", retries + 1)
      // Wait a bit for webhook to create profile
      await new Promise((resolve) => setTimeout(resolve, 1000))
      retries++
    }
  }

  if (!profile) {
    console.log("[v0] Creating profile manually for user", userId)
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        role: "buyer",
        verification_status: "pending",
      })
      .select()
      .single()

    profile = newProfile
  }

  if (profile?.role === "seller") {
    redirect("/dashboard/seller")
  }

  return <BuyerDashboard userId={userId} profile={profile} />
}
