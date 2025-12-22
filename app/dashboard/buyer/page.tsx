import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard"

export default async function BuyerDashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/auth?tab=login")
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
    
    // Get user details from Clerk
    const user = await currentUser()
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com"
    const userFullName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.firstName || user?.lastName || null

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: userEmail,
        full_name: userFullName,
        role: "buyer",
        verification_status: "pending",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Failed to create profile:", insertError)
      // Create a fallback profile object to prevent null errors
      profile = {
        id: userId,
        email: userEmail,
        full_name: userFullName,
        role: "buyer",
        verification_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } else {
      profile = newProfile
    }
  }

  if (profile?.role === "seller") {
    redirect("/dashboard/seller")
  }

  return <BuyerDashboard userId={userId} profile={profile} />
}
