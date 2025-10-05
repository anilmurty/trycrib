import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { OnboardingClient } from "@/components/onboarding/onboarding-client"

export default async function OnboardingPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/auth")
  }

  const supabase = await createClient()
  
  // Add retry logic for profile check
  let profile = null
  let retries = 0
  const maxRetries = 3

  while (!profile && retries < maxRetries) {
    const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()
    
    if (data) {
      profile = data
    } else if (error) {
      console.log("Profile not found in onboarding, attempt", retries + 1)
      await new Promise((resolve) => setTimeout(resolve, 300))
      retries++
    }
  }

  // If user already has a role, redirect to dashboard
  if (profile?.role) {
    redirect("/dashboard")
  }

  return <OnboardingClient firstName={user.firstName || "there"} />
}
